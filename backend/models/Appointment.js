import { query } from '../config/database.js';

class Appointment {
    // Create a new appointment
    static async create(appointmentData) {
        const {
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            duration_minutes = 30,
            status = 'scheduled',
            reason,
            notes
        } = appointmentData;

        try {
            const queryText = `
                INSERT INTO appointments (
                    patient_id, doctor_id, appointment_date, appointment_time,
                    duration_minutes, status, reason, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;
            const values = [
                patient_id,
                doctor_id,
                appointment_date,
                appointment_time,
                duration_minutes,
                status,
                reason,
                notes
            ];
            const result = await query(queryText, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creating appointment: ${error.message}`);
        }
    }

    // Get appointment by ID
    static async findById(id) {
        try {
            const queryText = `
                SELECT a.*, 
                       p.user_id AS patient_user_id,
                       d.user_id AS doctor_user_id
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                LEFT JOIN doctors d ON a.doctor_id = d.id
                WHERE a.id = $1
            `;
            const result = await query(queryText, [id]);
            if (result.rows.length > 0) return result.rows[0];
            return null;
        } catch (error) {
            throw new Error(`Error finding appointment: ${error.message}`);
        }
    }

    // Get appointments for a patient (optionally by status/date)
    static async findByPatientId(patient_id, options = {}) {
        const {
            status = null, // filter by status if provided
            date_from = null, // filter start date
            date_to = null,   // filter end date
            limit = 10,
            offset = 0
        } = options;
        try {
            let queryText = `
                SELECT * FROM appointments
                WHERE patient_id = $1
            `;
            const values = [patient_id];
            let param = 2;
            if (status) {
                queryText += ` AND status = $${param++}`;
                values.push(status);
            }
            if (date_from) {
                queryText += ` AND appointment_date >= $${param++}`;
                values.push(date_from);
            }
            if (date_to) {
                queryText += ` AND appointment_date <= $${param++}`;
                values.push(date_to);
            }
            queryText += ` ORDER BY appointment_date DESC, appointment_time DESC LIMIT $${param++} OFFSET $${param}`;
            values.push(limit, offset);
            const result = await query(queryText, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error finding appointments for patient: ${error.message}`);
        }
    }

    // Get appointments for a doctor (optionally by status/date)
    static async findByDoctorId(doctor_id, options = {}) {
        const {
            status = null,
            date_from = null,
            date_to = null,
            limit = 10,
            offset = 0
        } = options;
        try {
            let queryText = `
                SELECT * FROM appointments
                WHERE doctor_id = $1
            `;
            const values = [doctor_id];
            let param = 2;
            if (status) {
                queryText += ` AND status = $${param++}`;
                values.push(status);
            }
            if (date_from) {
                queryText += ` AND appointment_date >= $${param++}`;
                values.push(date_from);
            }
            if (date_to) {
                queryText += ` AND appointment_date <= $${param++}`;
                values.push(date_to);
            }
            queryText += ` ORDER BY appointment_date DESC, appointment_time DESC LIMIT $${param++} OFFSET $${param}`;
            values.push(limit, offset);
            const result = await query(queryText, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error finding appointments for doctor: ${error.message}`);
        }
    }

    // List all appointments (admin view, search/filter/pagination)
    static async findAll(options = {}) {
        const {
            status = null,
            doctor_id = null,
            patient_id = null,
            date_from = null,
            date_to = null,
            limit = 10,
            offset = 0
        } = options;
        try {
            let queryText = `
                SELECT a.*,
                    p.user_id AS patient_user_id,
                    d.user_id AS doctor_user_id
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                LEFT JOIN doctors d ON a.doctor_id = d.id
                WHERE 1=1
            `;
            const values = [];
            let param = 1;
            if (status) {
                queryText += ` AND a.status = $${param++}`;
                values.push(status);
            }
            if (doctor_id) {
                queryText += ` AND a.doctor_id = $${param++}`;
                values.push(doctor_id);
            }
            if (patient_id) {
                queryText += ` AND a.patient_id = $${param++}`;
                values.push(patient_id);
            }
            if (date_from) {
                queryText += ` AND a.appointment_date >= $${param++}`;
                values.push(date_from);
            }
            if (date_to) {
                queryText += ` AND a.appointment_date <= $${param++}`;
                values.push(date_to);
            }
            queryText += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT $${param++} OFFSET $${param}`;
            values.push(limit, offset);
            const result = await query(queryText, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching appointments: ${error.message}`);
        }
    }

    // Update appointment (status, date/time, reason, notes)
    static async update(id, updateData) {
        const fields = [];
        const values = [];
        let param = 1;

        // Only fields allowed to update:
        const allowed = ['appointment_date', 'appointment_time', 'duration_minutes', 'status', 'reason', 'notes'];
        for (const key of allowed) {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = $${param}`);
                values.push(updateData[key]);
                param++;
            }
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        const queryText = `
            UPDATE appointments
            SET ${fields.join(', ')}
            WHERE id = $${param}
            RETURNING *
        `;
        values.push(id);

        try {
            const result = await query(queryText, values);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error updating appointment: ${error.message}`);
        }
    }

    // Cancel (delete) appointment (usually sets status to "cancelled")
    static async cancel(id, cancelledBy = null) {
        try {
            // Optionally log cancelledBy info in audit log (not implemented here)
            const result = await query(
                `UPDATE appointments SET status='cancelled', updated_at = CURRENT_TIMESTAMP WHERE id=$1 RETURNING *`,
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error cancelling appointment: ${error.message}`);
        }
    }

    // Hard-delete appointment (usually not used, but method is available)
    static async delete(id) {
        try {
            const result = await query(`DELETE FROM appointments WHERE id=$1 RETURNING *`, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error deleting appointment: ${error.message}`);
        }
    }

    // Validation helper for appointment creation/updation (basic)
    static validateAppointmentData(data, isUpdate = false) {
        const errors = [];
        if (!isUpdate) {
            if (!data.patient_id) errors.push("patient_id is required");
            if (!data.doctor_id) errors.push("doctor_id is required");
            if (!data.appointment_date) errors.push("appointment_date is required");
            if (!data.appointment_time) errors.push("appointment_time is required");
        }
        if (data.status && !['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'].includes(data.status)) {
            errors.push("Invalid status value");
        }
        if (data.duration_minutes && (isNaN(data.duration_minutes) || data.duration_minutes <= 0)) {
            errors.push("duration_minutes must be a positive number");
        }
        // You can add more checks for date format, conflicting slots, etc.
        return errors;
    }
}

export default Appointment;
