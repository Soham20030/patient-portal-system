import express from 'express';
import * as PrescriptionController from '../controllers/prescriptionController.js';
import authMiddleware from '../middleware/auth.js'; // Use your authentication middleware

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new prescription
router.post('/', PrescriptionController.createPrescription);

// Get a prescription by ID
router.get('/:id', PrescriptionController.getPrescriptionById);

// Get prescriptions by patient ID
router.get('/patient/:id', PrescriptionController.getPrescriptionsByPatient);

// Get prescriptions by doctor ID
router.get('/doctor/:id', PrescriptionController.getPrescriptionsByDoctor);

// Update a prescription by ID
router.put('/:id', PrescriptionController.updatePrescription);

// Delete a prescription by ID
router.delete('/:id', PrescriptionController.deletePrescription);

export default router;
