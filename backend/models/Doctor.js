import { query } from '../config/database.js';

class Doctor {
    // Create a new doctor profile
    static async create(doctorData) {
        const {
            user_id,
            specialization,
            license_number,
            phone,
            years_experience,
            education,
            consultation_fee,
            availability,
            is_available = true
        } = doctorData;

        try {
            const queryText = `
                INSERT INTO doctors (
                    user_id, specialization, license_number, phone,
                    years_experience, education, consultation_fee,
                    availability, is_available
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING *
            `;

            const values = [
                user_id, specialization, license_number, phone,
                years_experience, education, consultation_fee,
                JSON.stringify(availability), is_available
            ];

            const result = await query(queryText, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creating doctor: ${error.message}`);
        }
    }

    // Find doctor by ID
    static async findById(id) {
        try {
            const queryText = `
                SELECT d.*, u.first_name, u.last_name, u.email, u.role, u.is_active
                FROM doctors d
                JOIN users u ON d.user_id = u.id
                WHERE d.id = $1 AND u.is_active = TRUE
            `;
            
            const result = await query(queryText, [id]);
            if (result.rows[0] && result.rows[0].availability) {
                result.rows[0].availability = JSON.parse(result.rows[0].availability);
            }
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding doctor: ${error.message}`);
        }
    }

    // Find doctor by user ID
    static async findByUserId(userId) {
        try {
            const queryText = `
                SELECT d.*, u.first_name, u.last_name, u.email, u.role, u.is_active
                FROM doctors d
                JOIN users u ON d.user_id = u.id
                WHERE d.user_id = $1 AND u.is_active = TRUE
            `;
            
            const result = await query(queryText, [userId]);
            if (result.rows[0] && result.rows[0].availability) {
                result.rows[0].availability = JSON.parse(result.rows[0].availability);
            }
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding doctor by user ID: ${error.message}`);
        }
    }

    // Update doctor information
    static async update(id, doctorData) {
        const {
            specialization,
            license_number,
            phone,
            years_experience,
            education,
            consultation_fee,
            availability,
            is_available
        } = doctorData;

        try {
            const queryText = `
                UPDATE doctors 
                SET 
                    specialization = COALESCE($1, specialization),
                    license_number = COALESCE($2, license_number),
                    phone = COALESCE($3, phone),
                    years_experience = COALESCE($4, years_experience),
                    education = COALESCE($5, education),
                    consultation_fee = COALESCE($6, consultation_fee),
                    availability = COALESCE($7, availability),
                    is_available = COALESCE($8, is_available),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $9
                RETURNING *
            `;

            const values = [
                specialization, license_number, phone, years_experience,
                education, consultation_fee, 
                availability ? JSON.stringify(availability) : null,
                is_available, id
            ];

            const result = await query(queryText, values);
            if (result.rows[0] && result.rows[0].availability) {
                result.rows[0].availability = JSON.parse(result.rows[0].availability);
            }
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error updating doctor: ${error.message}`);
        }
    }

    // Soft delete doctor (set user inactive)
    static async delete(id) {
        try {
            // First get the user_id
            const doctorQuery = 'SELECT user_id FROM doctors WHERE id = $1';
            const doctorResult = await query(doctorQuery, [id]);
            
            if (!doctorResult.rows[0]) {
                throw new Error('Doctor not found');
            }

            const userId = doctorResult.rows[0].user_id;

            // Soft delete by deactivating the user
            const updateQuery = 'UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING *';
            const result = await query(updateQuery, [userId]);
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error deleting doctor: ${error.message}`);
        }
    }

    // Find all doctors with filtering and pagination
    static async findAll(options = {}) {
        const { 
            limit = 10, 
            offset = 0, 
            search = '', 
            specialization = '',
            is_available = null 
        } = options;
        
        try {
            let queryText = `
                SELECT d.*, u.first_name, u.last_name, u.email, u.role
                FROM doctors d
                JOIN users u ON d.user_id = u.id
                WHERE u.is_active = TRUE
            `;

            const values = [];
            let paramCount = 0;

            // Add search functionality
            if (search) {
                paramCount++;
                queryText += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR d.specialization ILIKE $${paramCount})`;
                values.push(`%${search}%`);
            }

            // Filter by specialization
            if (specialization) {
                paramCount++;
                queryText += ` AND d.specialization ILIKE $${paramCount}`;
                values.push(`%${specialization}%`);
            }

            // Filter by availability
            if (is_available !== null) {
                paramCount++;
                queryText += ` AND d.is_available = $${paramCount}`;
                values.push(is_available);
            }

            // Add pagination
            queryText += ` ORDER BY d.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
            values.push(limit, offset);

            const result = await query(queryText, values);
            
            // Parse JSON availability for each doctor
            result.rows.forEach(doctor => {
                if (doctor.availability) {
                    doctor.availability = JSON.parse(doctor.availability);
                }
            });

            // Get total count for pagination
            let countQuery = `
                SELECT COUNT(*) 
                FROM doctors d 
                JOIN users u ON d.user_id = u.id 
                WHERE u.is_active = TRUE
            `;
            
            const countValues = [];
            let countParamCount = 0;

            if (search) {
                countParamCount++;
                countQuery += ` AND (u.first_name ILIKE $${countParamCount} OR u.last_name ILIKE $${countParamCount} OR d.specialization ILIKE $${countParamCount})`;
                countValues.push(`%${search}%`);
            }

            if (specialization) {
                countParamCount++;
                countQuery += ` AND d.specialization ILIKE $${countParamCount}`;
                countValues.push(`%${specialization}%`);
            }

            if (is_available !== null) {
                countParamCount++;
                countQuery += ` AND d.is_available = $${countParamCount}`;
                countValues.push(is_available);
            }

            const countResult = await query(countQuery, countValues);
            const total = parseInt(countResult.rows[0].count);

            return {
                doctors: result.rows,
                total,
                limit,
                offset,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw new Error(`Error fetching doctors: ${error.message}`);
        }
    }

    // Get doctors by specialization (public endpoint)
    static async findBySpecialization(specialization, options = {}) {
        const { limit = 10, offset = 0 } = options;
        
        try {
            const queryText = `
                SELECT d.*, u.first_name, u.last_name
                FROM doctors d
                JOIN users u ON d.user_id = u.id
                WHERE u.is_active = TRUE 
                AND d.is_available = TRUE 
                AND d.specialization ILIKE $1
                ORDER BY d.years_experience DESC
                LIMIT $2 OFFSET $3
            `;

            const result = await query(queryText, [`%${specialization}%`, limit, offset]);
            
            // Parse JSON availability
            result.rows.forEach(doctor => {
                if (doctor.availability) {
                    doctor.availability = JSON.parse(doctor.availability);
                }
            });

            return result.rows;
        } catch (error) {
            throw new Error(`Error finding doctors by specialization: ${error.message}`);
        }
    }

    // Validation helper method
    static validateDoctorData(data, isUpdate = false) {
        const errors = [];

        // Required fields for creation
        if (!isUpdate) {
            if (!data.user_id) errors.push('User ID is required');
            if (!data.specialization) errors.push('Specialization is required');
            if (!data.license_number) errors.push('License number is required');
        }

        // License number format validation (basic)
        if (data.license_number && !/^[A-Z0-9]{6,20}$/.test(data.license_number)) {
            errors.push('License number should be 6-20 characters, letters and numbers only');
        }

        // Phone validation
        if (data.phone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(data.phone)) {
            errors.push('Invalid phone number format');
        }

        // Years of experience validation
        if (data.years_experience !== undefined && (data.years_experience < 0 || data.years_experience > 50)) {
            errors.push('Years of experience must be between 0 and 50');
        }

        // Consultation fee validation
        if (data.consultation_fee !== undefined && data.consultation_fee < 0) {
            errors.push('Consultation fee cannot be negative');
        }

        return errors;
    }
}

export default Doctor;
