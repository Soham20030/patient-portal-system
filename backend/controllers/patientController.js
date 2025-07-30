import Patient from '../models/Patient.js';

class PatientController {
    // Create a new patient profile
    static async createPatient(req, res) {
        try {
            // Validate input data for creation
            const validationErrors = Patient.validatePatientData(req.body, false);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            // Ensure the patient is creating their own profile
            if (req.user.role === 'patient' && req.body.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only create your own patient profile'
                });
            }

            // Check if patient profile already exists
            const existingPatient = await Patient.findByUserId(req.body.user_id);
            if (existingPatient) {
                return res.status(409).json({
                    success: false,
                    message: 'Patient profile already exists for this user'
                });
            }

            const newPatient = await Patient.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Patient profile created successfully',
                data: newPatient
            });

        } catch (error) {
            console.error('Error creating patient:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get a single patient by ID
    static async getPatient(req, res) {
        try {
            const { id } = req.params;
            const patient = await Patient.findById(id);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Security check: patients can only view their own data
            if (req.user.role === 'patient' && patient.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only view your own profile'
                });
            }

            res.status(200).json({
                success: true,
                data: patient
            });

        } catch (error) {
            console.error('Error fetching patient:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get patient by user ID (useful for logged-in patient to get their profile)
    static async getPatientByUserId(req, res) {
        try {
            const { userId } = req.params;

            // Security check: patients can only view their own data
            if (req.user.role === 'patient' && parseInt(userId) !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only view your own profile'
                });
            }

            const patient = await Patient.findByUserId(userId);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient profile not found'
                });
            }

            res.status(200).json({
                success: true,
                data: patient
            });

        } catch (error) {
            console.error('Error fetching patient by user ID:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update patient information
    static async updatePatient(req, res) {
        try {
            const { id } = req.params;

            // Get the update data (excluding user_id for updates)
            const updateData = { ...req.body };
            delete updateData.user_id; // Don't allow changing user_id

            // Check if patient exists first
            const existingPatient = await Patient.findById(id);
            if (!existingPatient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Security check: patients can only update their own data
            if (req.user.role === 'patient' && existingPatient.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only update your own profile'
                });
            }

            // Validate data for update (isUpdate = true)
            const validationErrors = Patient.validatePatientData(updateData, true);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            const updatedPatient = await Patient.update(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Patient profile updated successfully',
                data: updatedPatient
            });

        } catch (error) {
            console.error('Error updating patient:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete patient (soft delete)
    static async deletePatient(req, res) {
        try {
            const { id } = req.params;

            // Check if patient exists
            const existingPatient = await Patient.findById(id);
            if (!existingPatient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Security check: only admin can delete or patients can delete their own profile
            if (req.user.role === 'patient' && existingPatient.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only delete your own profile'
                });
            }

            await Patient.delete(id);

            res.status(200).json({
                success: true,
                message: 'Patient profile deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting patient:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all patients with pagination (admin/doctor only)
    static async getAllPatients(req, res) {
        try {
            // Only admin and doctors can view all patients
            if (req.user.role === 'patient') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient permissions'
                });
            }

            const { 
                page = 1, 
                limit = 10, 
                search = '' 
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            const options = {
                limit: parseInt(limit),
                offset,
                search
            };

            const result = await Patient.findAll(options);

            res.status(200).json({
                success: true,
                data: result.patients,
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
            console.error('Error fetching all patients:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get current user's patient profile (convenience method)
    static async getMyProfile(req, res) {
        try {
            const patient = await Patient.findByUserId(req.user.id);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient profile not found. Please create your profile first.'
                });
            }

            res.status(200).json({
                success: true,
                data: patient
            });

        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

export default PatientController;
