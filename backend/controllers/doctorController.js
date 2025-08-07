import Doctor from '../models/Doctor.js';

class DoctorController {
    // Create a new doctor profile (admin only)
    static async createDoctor(req, res) {
        try {
            // Only admin can create doctor profiles
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Only admin users can create doctor profiles.'
                });
            }

            // Validate request data
            const validationErrors = Doctor.validateDoctorData(req.body, false);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            // Check that doctor profile does not already exist for user
            const existingDoctor = await Doctor.findByUserId(req.body.user_id);
            if (existingDoctor) {
                return res.status(409).json({
                    success: false,
                    message: 'Doctor profile already exists for this user.'
                });
            }

            const newDoctor = await Doctor.create(req.body);

            res.status(201).json({
                success: true,
                message: 'Doctor profile created successfully.',
                data: newDoctor
            });
        } catch (error) {
            console.error('Error creating doctor:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get details of a single doctor by doctor ID (available to all roles)
    static async getDoctor(req, res) {
        try {
            const { id } = req.params;
            const doctor = await Doctor.findById(id);

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            res.status(200).json({
                success: true,
                data: doctor
            });
        } catch (error) {
            console.error('Error fetching doctor:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get current user's doctor profile (for doctors)
    static async getMyProfile(req, res) {
        try {
            if (req.user.role !== 'doctor') {
                return res.status(403).json({
                    success: false,
                    message: 'Only doctors can access their own profile with this endpoint.'
                });
            }

            const doctor = await Doctor.findByUserId(req.user.id);

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found.'
                });
            }

            res.status(200).json({
                success: true,
                data: doctor
            });
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update doctor profile (doctor or admin)
    static async updateDoctor(req, res) {
        try {
            const { id } = req.params;

            // Get existing doctor to check ownership/permissions
            const existingDoctor = await Doctor.findById(id);
            if (!existingDoctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            // Only admin or the doctor who owns the profile can update
            if (
                req.user.role !== 'admin' &&
                !(req.user.role === 'doctor' && existingDoctor.user_id === req.user.id)
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only update your own doctor profile.'
                });
            }

            // Validate update data
            const validationErrors = Doctor.validateDoctorData(req.body, true);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            const updatedDoctor = await Doctor.update(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Doctor profile updated successfully.',
                data: updatedDoctor
            });
        } catch (error) {
            console.error('Error updating doctor:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete (deactivate) doctor profile (admin only)
    static async deleteDoctor(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Only admin can delete doctor profiles.'
                });
            }

            const { id } = req.params;
            const existingDoctor = await Doctor.findById(id);
            if (!existingDoctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            await Doctor.delete(id);

            res.status(200).json({
                success: true,
                message: 'Doctor profile deleted (deactivated) successfully.'
            });
        } catch (error) {
            console.error('Error deleting doctor:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all doctors (public, patients, or for admin/doctor dashboard - with filtering)
    static async getAllDoctors(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                specialization = '',
                is_available = null
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const options = {
                limit: parseInt(limit),
                offset,
                search,
                specialization,
                is_available: is_available === null ? null : is_available === 'true'
            };

            const result = await Doctor.findAll(options);

            res.status(200).json({
                success: true,
                data: result.doctors,
                pagination: {
                    total: result.total,
                    totalPages: result.totalPages,
                    currentPage: parseInt(page),
                    limit: result.limit,
                    hasNext: parseInt(page) < result.totalPages,
                    hasPrev: parseInt(page) > 1
                }
            });
        } catch (error) {
            console.error('Error fetching all doctors:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get doctors by specialization (public)
    static async getDoctorsBySpecialization(req, res) {
        try {
            const { specialization } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const doctors = await Doctor.findBySpecialization(specialization, {
                limit: parseInt(limit),
                offset
            });

            res.status(200).json({
                success: true,
                data: doctors
            });
        } catch (error) {
            console.error('Error fetching doctors by specialization:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

export default DoctorController;
