const db = require('../config/db');

exports.createRequest = async (req, res) => {
  try {
    const { hospitalId, patientName, requiredBloodGroup, unitsRequired, urgencyLevel, city, state, pincode } = req.body;
    const userId = req.user.userId;

    if (!hospitalId || !patientName || !requiredBloodGroup || !unitsRequired || !urgencyLevel || !city || !state) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [result] = await db.query(
      'INSERT INTO blood_request (user_id, hospital_id, patient_name, required_blood_group, units_required, urgency_level, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, hospitalId, patientName, requiredBloodGroup, unitsRequired, urgencyLevel, city, state, pincode || null]
    );

    res.status(201).json({ message: 'Blood request created', requestId: result.insertId });
  } catch (error) {
    console.error('Request Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const [requests] = await db.query('SELECT * FROM blood_request WHERE status = "PENDING"');
    res.status(200).json({ data: requests });
  } catch (error) {
    console.error('Fetch Requests Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
