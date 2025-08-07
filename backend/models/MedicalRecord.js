import { query } from '../config/database.js';

class MedicalRecord {
    // Create a new medical record
    static async create(recordData) {
        const {
            patient_id,
            doctor_id,
            appointment_id,
            record_type,
            title,
            description,
            diagnosis,
            treatment_plan,
            file_path,
            record_date,
        } = recordData;

        try {
            const queryText = `
                INSERT INTO medical_records (
                    patient_id,
                    doctor_id,
                    appointment_id,
                    record_type,
                    title,
                    description,
                    diagnosis,
                    treatment_plan,
                    file_path,
                    record_date
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                RETURNING *
            `;

            const values = [
                patient_id,
                doctor_id,
                appointment_id || null,
                record_type,
                title,
                description || null,
                diagnosis || null,
                treatment_plan || null,
                file_path || null,
                record_date || new Date() // defaults to current date if not provided
            ];

            const result = await query(queryText, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creating medical record: ${error.message}`);
        }
    }

    // Find medical record by ID
    static async findById(id) {
        try {
            const queryText = `SELECT * FROM medical_records WHERE id = $1`;
            const result = await query(queryText, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding medical record: ${error.message}`);
        }
    }

    // Find medical records by patient ID (with optional pagination)
    static async findByPatientId(patient_id, options = {}) {
        const { limit = 10, offset = 0 } = options;
        try {
            const queryText = `
                SELECT * FROM medical_records
                WHERE patient_id = $1
                ORDER BY record_date DESC, created_at DESC
                LIMIT $2 OFFSET $3
            `;
            const result = await query(queryText, [patient_id, limit, offset]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error finding medical records for patient: ${error.message}`);
        }
    }

    // Find medical records by doctor ID (with optional pagination)
    static async findByDoctorId(doctor_id, options = {}) {
        const { limit = 10, offset = 0 } = options;
        try {
            const queryText = `
                SELECT * FROM medical_records
                WHERE doctor_id = $1
                ORDER BY record_date DESC, created_at DESC
                LIMIT $2 OFFSET $3
            `;
            const result = await query(queryText, [doctor_id, limit, offset]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error finding medical records for doctor: ${error.message}`);
        }
    }

    // Update a medical record by ID
    static async update(id, updateData) {
        const allowedFields = ['record_type', 'title', 'description', 'diagnosis', 'treatment_plan', 'file_path', 'record_date', 'appointment_id'];
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
        
        // Add updated_at timestamp update
        setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

        const queryText = `
            UPDATE medical_records
            SET ${setClauses.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        values.push(id);

        try {
            const result = await query(queryText, values);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error updating medical record: ${error.message}`);
        }
    }

    // Delete a medical record by ID
    static async delete(id) {
        try {
            const queryText = `DELETE FROM medical_records WHERE id = $1 RETURNING *`;
            const result = await query(queryText, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error deleting medical record: ${error.message}`);
        }
    }

    // Basic validation for medical records
    static validateMedicalRecordData(data, isUpdate = false) {
        const errors = [];

        if (!isUpdate) {
            if (!data.patient_id) errors.push('patient_id is required');
            if (!data.doctor_id) errors.push('doctor_id is required');
            if (!data.record_type) errors.push('record_type is required');
            if (!data.title) errors.push('title is required');
        }

        if (data.record_type) {
            // Example of accepted types, same as your DB check constraint
            const validTypes = ['consultation', 'lab_result', 'prescription', 'diagnosis', 'procedure'];
            if (!validTypes.includes(data.record_type)) {
                errors.push(`record_type must be one of: ${validTypes.join(', ')}`);
            }
        }

        return errors;
    }
}

export default MedicalRecord;
