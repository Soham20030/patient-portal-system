import express from 'express';
import * as LabResultController from '../controllers/labResultController.js';
import authMiddleware from '../middleware/auth.js';  // Use your existing auth middleware

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new lab result
router.post('/', LabResultController.createLabResult);

// Get lab result by ID
router.get('/:id', LabResultController.getLabResultById);

// Get lab results by patient ID
router.get('/patient/:id', LabResultController.getLabResultsByPatient);

// Update a lab result by ID
router.put('/:id', LabResultController.updateLabResult);

// Delete a lab result by ID
router.delete('/:id', LabResultController.deleteLabResult);

export default router;
