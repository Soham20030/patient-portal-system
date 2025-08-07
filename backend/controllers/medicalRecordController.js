import MedicalRecord from '../models/MedicalRecord.js';

// Create a new medical record
export const createMedicalRecord = async (req, res) => {
  const errors = MedicalRecord.validateMedicalRecordData(req.body);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });

  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get medical record by ID
export const getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Medical record not found.' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get medical records by patient ID
export const getMedicalRecordsByPatient = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    const records = await MedicalRecord.findByPatientId(req.params.id, {
      limit: Number(limit) || 10,
      offset: Number(offset) || 0,
    });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get medical records by doctor ID
export const getMedicalRecordsByDoctor = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    const records = await MedicalRecord.findByDoctorId(req.params.id, {
      limit: Number(limit) || 10,
      offset: Number(offset) || 0,
    });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update medical record by ID
export const updateMedicalRecord = async (req, res) => {
  const errors = MedicalRecord.validateMedicalRecordData(req.body, true);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });

  try {
    const record = await MedicalRecord.update(req.params.id, req.body);
    if (!record) return res.status(404).json({ success: false, message: 'Medical record not found.' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete medical record by ID
export const deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.delete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Medical record not found.' });
    res.json({ success: true, message: 'Medical record deleted successfully.', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
