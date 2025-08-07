import express from 'express';
import * as AppointmentController from '../controllers/appointmentController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', AppointmentController.createAppointment);
router.get('/:id', AppointmentController.getAppointmentById);
router.get('/patient/:id', AppointmentController.getAppointmentsByPatient);
router.get('/doctor/:id', AppointmentController.getAppointmentsByDoctor);
router.get('/', AppointmentController.listAppointments);
router.put('/:id', AppointmentController.updateAppointment);
router.delete('/:id', AppointmentController.cancelAppointment);

export default router;
