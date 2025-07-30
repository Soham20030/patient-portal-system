import { query } from '../config/database.js';

class Patient {
    // Create a new patient profile
    static async create(patientData) {
        const {
            user_id,
            date_of_birth,
            phone,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            blood_type,
            allergies,
            medical_conditions,
            insurance_provider,
            insurance_policy_number
        } = patientData;

        try {
            const queryText = `
                INSERT INTO patients (
                    user_id, date_of_birth, phone, address, 
                    emergency_contact_name, emergency_contact_phone, 
                    blood_type, allergies, medical_conditions, 
                    insurance_provider, insurance_policy_number
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                RETURNING *
            `;

            const values = [
                user_id, date_of_birth, phone, address,
                emergency_contact_name, emergency_contact_phone,
                blood_type, allergies, medical_conditions,
                insurance_provider, insurance_policy_number
            ];

            const result = await query(queryText, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creating patient: ${error.message}`);
        }
    }

    // Find patient by ID
    static async findById(id) {
        try {
            const queryText = `
                SELECT p.*, u.first_name, u.last_name, u.email, u.role
                FROM patients p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = $1
            `;
            
            const result = await query(queryText, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding patient: ${error.message}`);
        }
    }

    // Find patient by user ID (important for authentication)
    static async findByUserId(userId) {
        try {
            const queryText = `
                SELECT p.*, u.first_name, u.last_name, u.email, u.role
                FROM patients p
                JOIN users u ON p.user_id = u.id
                WHERE p.user_id = $1
            `;
            
            const result = await query(queryText, [userId]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding patient by user ID: ${error.message}`);
        }
    }

    // Update patient information
    static async update(id, patientData) {
        const {
            date_of_birth,
            phone,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            blood_type,
            allergies,
            medical_conditions,
            insurance_provider,
            insurance_policy_number
        } = patientData;

        try {
            const queryText = `
                UPDATE patients 
                SET 
                    date_of_birth = COALESCE($1, date_of_birth),
                    phone = COALESCE($2, phone),
                    address = COALESCE($3, address),
                    emergency_contact_name = COALESCE($4, emergency_contact_name),
                    emergency_contact_phone = COALESCE($5, emergency_contact_phone),
                    blood_type = COALESCE($6, blood_type),
                    allergies = COALESCE($7, allergies),
                    medical_conditions = COALESCE($8, medical_conditions),
                    insurance_provider = COALESCE($9, insurance_provider),
                    insurance_policy_number = COALESCE($10, insurance_policy_number),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $11
                RETURNING *
            `;

            const values = [
                date_of_birth, phone, address,
                emergency_contact_name, emergency_contact_phone,
                blood_type, allergies, medical_conditions,
                insurance_provider, insurance_policy_number, id
            ];

            const result = await query(queryText, values);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error updating patient: ${error.message}`);
        }
    }

    // Delete patient (soft delete by setting user inactive)
    static async delete(id) {
        try {
            // First get the user_id
            const patientQuery = 'SELECT user_id FROM patients WHERE id = $1';
            const patientResult = await query(patientQuery, [id]);
            
            if (!patientResult.rows[0]) {
                throw new Error('Patient not found');
            }

            const userId = patientResult.rows[0].user_id;

            // Soft delete by deactivating the user
            const updateQuery = 'UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING *';
            const result = await query(updateQuery, [userId]);
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error deleting patient: ${error.message}`);
        }
    }

    // Find all patients with pagination
    static async findAll(options = {}) {
        const { limit = 10, offset = 0, search = '' } = options;
        
        try {
            let queryText = `
                SELECT p.*, u.first_name, u.last_name, u.email, u.role
                FROM patients p
                JOIN users u ON p.user_id = u.id
                WHERE u.is_active = TRUE
            `;

            const values = [];
            let paramCount = 0;

            // Add search functionality
            if (search) {
                paramCount++;
                queryText += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
                values.push(`%${search}%`);
            }

            // Add pagination
            queryText += ` ORDER BY p.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
            values.push(limit, offset);

            const result = await query(queryText, values);
            
            // Get total count for pagination
            const countQuery = `
                SELECT COUNT(*) 
                FROM patients p 
                JOIN users u ON p.user_id = u.id 
                WHERE u.is_active = TRUE
                ${search ? 'AND (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1)' : ''}
            `;
            
            const countValues = search ? [`%${search}%`] : [];
            const countResult = await query(countQuery, countValues);
            const total = parseInt(countResult.rows[0].count);

            return {
                patients: result.rows,
                total,
                limit,
                offset,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw new Error(`Error fetching patients: ${error.message}`);
        }
    }

    // Validation helper method - updated to handle both create and update operations
    static validatePatientData(data, isUpdate = false) {
        const errors = [];

        // Required fields for creation only
        if (!isUpdate) {
            if (!data.user_id) errors.push('User ID is required');
            if (!data.date_of_birth) errors.push('Date of birth is required');
        }

        // Date validation (only if date_of_birth is provided)
        if (data.date_of_birth) {
            const birthDate = new Date(data.date_of_birth);
            const today = new Date();
            if (birthDate > today) {
                errors.push('Date of birth cannot be in the future');
            }
        }

        // Phone validation (basic)
        if (data.phone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(data.phone)) {
            errors.push('Invalid phone number format');
        }

        if (data.emergency_contact_phone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(data.emergency_contact_phone)) {
            errors.push('Invalid emergency contact phone format');
        }

        return errors;
    }
}

export default Patient;
