import Prescription from '../models/Prescription.js';

// Create a new prescription
export const createPrescription = async (req, res) => {
  const errors = Prescription.validatePrescriptionData(req.body);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });

  try {
    const prescription = await Prescription.create(req.body);
    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get prescription by ID
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });
    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get prescriptions for a patient
export const getPrescriptionsByPatient = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    const prescriptions = await Prescription.findByPatientId(req.params.id, {
      limit: Number(limit) || 10,
      offset: Number(offset) || 0,
    });
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get prescriptions for a doctor
export const getPrescriptionsByDoctor = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    const prescriptions = await Prescription.findByDoctorId(req.params.id, {
      limit: Number(limit) || 10,
      offset: Number(offset) || 0,
    });
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a prescription by ID
export const updatePrescription = async (req, res) => {
  const errors = Prescription.validatePrescriptionData(req.body, true);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });

  try {
    const prescription = await Prescription.update(req.params.id, req.body);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });
    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a prescription by ID
export const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.delete(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });
    res.json({ success: true, message: 'Prescription deleted successfully.', data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
