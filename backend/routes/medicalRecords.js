import express from 'express';
import * as MedicalRecordController from '../controllers/medicalRecordController.js';
import authMiddleware from '../middleware/auth.js'; // assuming you have auth middleware

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new medical record
router.post('/', MedicalRecordController.createMedicalRecord);

// Get medical record by ID
router.get('/:id', MedicalRecordController.getMedicalRecordById);

// Get medical records by patient ID
router.get('/patient/:id', MedicalRecordController.getMedicalRecordsByPatient);

// Get medical records by doctor ID
router.get('/doctor/:id', MedicalRecordController.getMedicalRecordsByDoctor);

// Update a medical record by ID
router.put('/:id', MedicalRecordController.updateMedicalRecord);

// Delete a medical record by ID
router.delete('/:id', MedicalRecordController.deleteMedicalRecord);

export default router;
