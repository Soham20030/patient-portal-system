import express from 'express';
import PatientController from '../controllers/patientController.js';
import authMiddleware from '../middleware/auth.js';  // ✅ Fixed import

const router = express.Router();

// Apply authentication middleware to all patient routes
router.use(authMiddleware);  // ✅ Use authMiddleware instead of authenticateToken

// Patient CRUD routes
router.post('/', PatientController.createPatient);
router.get('/me', PatientController.getMyProfile);
router.get('/all', PatientController.getAllPatients);
router.get('/user/:userId', PatientController.getPatientByUserId);
router.get('/:id', PatientController.getPatient);
router.put('/:id', PatientController.updatePatient);
router.delete('/:id', PatientController.deletePatient);

export default router;
