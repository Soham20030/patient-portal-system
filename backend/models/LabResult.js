import { query } from '../config/database.js';

class LabResult {
  // Create a new lab result
  static async create(data) {
    const {
      medical_record_id,
      patient_id,
      test_name,
      test_type,
      result_value,
      reference_range,
      unit,
      status = 'pending',
      test_date = new Date(),
      lab_technician,
      notes,
    } = data;

    try {
      const queryText = `
        INSERT INTO lab_results (
          medical_record_id,
          patient_id,
          test_name,
          test_type,
          result_value,
          reference_range,
          unit,
          status,
          test_date,
          lab_technician,
          notes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
      `;
      const values = [
        medical_record_id,
        patient_id,
        test_name,
        test_type || null,
        result_value || null,
        reference_range || null,
        unit || null,
        status,
        test_date,
        lab_technician || null,
        notes || null,
      ];
      const result = await query(queryText, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating lab result: ${error.message}`);
    }
  }

  // Find lab result by ID
  static async findById(id) {
    try {
      const queryText = `SELECT * FROM lab_results WHERE id = $1`;
      const result = await query(queryText, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding lab result: ${error.message}`);
    }
  }

  // Find lab results by patient ID with pagination
  static async findByPatientId(patient_id, options = {}) {
    const { limit = 10, offset = 0 } = options;

    try {
      const queryText = `
        SELECT * FROM lab_results
        WHERE patient_id = $1
        ORDER BY test_date DESC, created_at DESC
        LIMIT $2 OFFSET $3
      `;
      const result = await query(queryText, [patient_id, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding lab results for patient: ${error.message}`);
    }
  }

  // Update lab result by ID
  static async update(id, updateData) {
    const allowedFields = [
      'test_name',
      'test_type',
      'result_value',
      'reference_range',
      'unit',
      'status',
      'test_date',
      'lab_technician',
      'notes',
      'medical_record_id',
      'patient_id'
    ];

    const setClauses = [];
    const values = [];
    let paramIdx = 1;

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        setClauses.push(`${field} = $${paramIdx++}`);
        values.push(updateData[field]);
      }
    }

    if (setClauses.length === 0) {
      throw new Error('No valid fields provided for update');
    }

    // Optionally update updated_at
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    const queryText = `
      UPDATE lab_results
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIdx}
      RETURNING *
    `;
    values.push(id);

    try {
      const result = await query(queryText, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating lab result: ${error.message}`);
    }
  }

  // Delete lab result by ID
  static async delete(id) {
    try {
      const queryText = `DELETE FROM lab_results WHERE id = $1 RETURNING *`;
      const result = await query(queryText, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error deleting lab result: ${error.message}`);
    }
  }

  // Basic validation for lab results
  static validateLabResultData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      if (!data.medical_record_id) errors.push('medical_record_id is required');
      if (!data.patient_id) errors.push('patient_id is required');
      if (!data.test_name) errors.push('test_name is required');
    }

    if (data.status) {
      const validStatuses = ['pending', 'completed', 'abnormal'];
      if (!validStatuses.includes(data.status)) {
        errors.push(`status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    return errors;
  }
}

export default LabResult;
