import express from 'express';
import DoctorController from '../controllers/doctorController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All doctor routes are protected (require authentication)
router.use(authMiddleware);

// Admin: create a new doctor profile
router.post('/', DoctorController.createDoctor);

// Any authenticated user: get all doctors with filters (public directory)
router.get('/', DoctorController.getAllDoctors);

// Any authenticated user: get doctor by ID
router.get('/:id', DoctorController.getDoctor);

// Any authenticated user: get doctors by specialization (directory, e.g. for patients to browse)
router.get('/specialty/:specialization', DoctorController.getDoctorsBySpecialization);

// Doctor: get own profile
router.get('/me/profile', DoctorController.getMyProfile);

// Doctor or admin: update doctor info (admin can update any, doctor can update own)
router.put('/:id', DoctorController.updateDoctor);

// Admin: deactivate doctor profile
router.delete('/:id', DoctorController.deleteDoctor);

export default router;
