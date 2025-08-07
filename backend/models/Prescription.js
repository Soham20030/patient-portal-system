import { query } from '../config/database.js';

class Prescription {
  // Create a new prescription
  static async create(prescriptionData) {
    const {
      medical_record_id,
      patient_id,
      doctor_id,
      medication_name,
      dosage,
      frequency,
      duration,
      instructions,
      status = 'active',
      prescribed_date = new Date(),
    } = prescriptionData;

    try {
      const queryText = `
        INSERT INTO prescriptions (
          medical_record_id,
          patient_id,
          doctor_id,
          medication_name,
          dosage,
          frequency,
          duration,
          instructions,
          status,
          prescribed_date
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `;
      const values = [
        medical_record_id,
        patient_id,
        doctor_id,
        medication_name,
        dosage,
        frequency,
        duration || null,
        instructions || null,
        status,
        prescribed_date,
      ];

      const result = await query(queryText, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating prescription: ${error.message}`);
    }
  }

  // Find prescription by ID
  static async findById(id) {
    try {
      const queryText = `SELECT * FROM prescriptions WHERE id = $1`;
      const result = await query(queryText, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding prescription: ${error.message}`);
    }
  }

  // Find prescriptions by patient ID (optionally with pagination)
  static async findByPatientId(patient_id, options = {}) {
    const { limit = 10, offset = 0 } = options;
    try {
      const queryText = `
        SELECT * FROM prescriptions
        WHERE patient_id = $1
        ORDER BY prescribed_date DESC, created_at DESC
        LIMIT $2 OFFSET $3
      `;
      const result = await query(queryText, [patient_id, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding prescriptions for patient: ${error.message}`);
    }
  }

  // Find prescriptions by doctor ID (optionally with pagination)
  static async findByDoctorId(doctor_id, options = {}) {
    const { limit = 10, offset = 0 } = options;
    try {
      const queryText = `
        SELECT * FROM prescriptions
        WHERE doctor_id = $1
        ORDER BY prescribed_date DESC, created_at DESC
        LIMIT $2 OFFSET $3
      `;
      const result = await query(queryText, [doctor_id, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding prescriptions for doctor: ${error.message}`);
    }
  }

  // Update prescription by ID
  static async update(id, updateData) {
    const allowedFields = [
      'medication_name',
      'dosage',
      'frequency',
      'duration',
      'instructions',
      'status',
      'prescribed_date',
      'medical_record_id',
    ];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex++}`);
        values.push(updateData[field]);
      }
    }

    if (setClauses.length === 0) {
      throw new Error('No valid fields provided for update');
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    const queryText = `
      UPDATE prescriptions
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    try {
      const result = await query(queryText, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating prescription: ${error.message}`);
    }
  }

  // Delete prescription by ID
  static async delete(id) {
    try {
      const queryText = `DELETE FROM prescriptions WHERE id = $1 RETURNING *`;
      const result = await query(queryText, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error deleting prescription: ${error.message}`);
    }
  }

  // Basic validation helper for prescription data
  static validatePrescriptionData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      if (!data.medical_record_id) errors.push('medical_record_id is required');
      if (!data.patient_id) errors.push('patient_id is required');
      if (!data.doctor_id) errors.push('doctor_id is required');
      if (!data.medication_name) errors.push('medication_name is required');
      if (!data.dosage) errors.push('dosage is required');
      if (!data.frequency) errors.push('frequency is required');
    }

    if (data.status && !['active', 'completed', 'cancelled'].includes(data.status)) {
      errors.push('status must be one of: active, completed, cancelled');
    }

    // You can add more complex validations here

    return errors;
  }
}

export default Prescription;
