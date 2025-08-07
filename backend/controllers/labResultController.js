import LabResult from '../models/LabResult.js';

// Create a new lab result
export const createLabResult = async (req, res) => {
  const errors = LabResult.validateLabResultData(req.body);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });

  try {
    const labResult = await LabResult.create(req.body);
    res.status(201).json({ success: true, data: labResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get lab result by ID
export const getLabResultById = async (req, res) => {
  try {
    const labResult = await LabResult.findById(req.params.id);
    if (!labResult) return res.status(404).json({ success: false, message: 'Lab result not found.' });
    res.json({ success: true, data: labResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get lab results by patient ID with pagination
export const getLabResultsByPatient = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    const labResults = await LabResult.findByPatientId(req.params.id, {
      limit: Number(limit) || 10,
      offset: Number(offset) || 0,
    });
    res.json({ success: true, data: labResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update lab result by ID
export const updateLabResult = async (req, res) => {
  const errors = LabResult.validateLabResultData(req.body, true);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });

  try {
    const labResult = await LabResult.update(req.params.id, req.body);
    if (!labResult) return res.status(404).json({ success: false, message: 'Lab result not found.' });
    res.json({ success: true, data: labResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete lab result by ID
export const deleteLabResult = async (req, res) => {
  try {
    const labResult = await LabResult.delete(req.params.id);
    if (!labResult) return res.status(404).json({ success: false, message: 'Lab result not found.' });
    res.json({ success: true, message: 'Lab result deleted successfully.', data: labResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
