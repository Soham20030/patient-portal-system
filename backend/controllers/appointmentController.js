import Appointment from '../models/Appointment.js';

export const createAppointment = async (req, res) => {
    const errors = Appointment.validateAppointmentData(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });

    try {
        const appointment = await Appointment.create(req.body);
        res.status(201).json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
        res.json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAppointmentsByPatient = async (req, res) => {
    try {
        const { limit, offset, status, date_from, date_to } = req.query;
        const appointments = await Appointment.findByPatientId(
            req.params.id,
            { limit: Number(limit) || 10, offset: Number(offset) || 0, status, date_from, date_to }
        );
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAppointmentsByDoctor = async (req, res) => {
    try {
        const { limit, offset, status, date_from, date_to } = req.query;
        const appointments = await Appointment.findByDoctorId(
            req.params.id,
            { limit: Number(limit) || 10, offset: Number(offset) || 0, status, date_from, date_to }
        );
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const listAppointments = async (req, res) => {
    try {
        const { status, doctor_id, patient_id, date_from, date_to, limit, offset } = req.query;
        const appointments = await Appointment.findAll({
            status,
            doctor_id,
            patient_id,
            date_from,
            date_to,
            limit: Number(limit) || 10,
            offset: Number(offset) || 0
        });
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateAppointment = async (req, res) => {
    const errors = Appointment.validateAppointmentData(req.body, true);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });

    try {
        const appointment = await Appointment.update(req.params.id, req.body);
        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
        res.json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.cancel(req.params.id);
        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
        res.json({ success: true, message: 'Appointment cancelled successfully.', data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
