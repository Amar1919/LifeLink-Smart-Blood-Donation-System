const db = require('../config/db');

exports.createMatch = async (req, res) => {
  try {
    const { requestId, donorId, matchScore } = req.body;

    if (!requestId || !donorId) {
      return res.status(400).json({ message: 'Request ID and Donor ID are required' });
    }

    const [result] = await db.query(
      'INSERT INTO match_record (request_id, donor_id, match_score, match_status, response_status) VALUES (?, ?, ?, ?, ?)',
      [requestId, donorId, matchScore || 99.99, 'SUGGESTED', 'PENDING']
    );

    res.status(201).json({ message: 'Match record created successfully', matchId: result.insertId });
  } catch (error) {
    console.error('Match Creation Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDonorMatches = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [donor] = await db.query('SELECT donor_id FROM donor WHERE user_id = ?', [userId]);
    if (donor.length === 0) {
      return res.status(404).json({ message: 'Donor profile not found for this user' });
    }

    const donorId = donor[0].donor_id;
    const [matches] = await db.query(`
      SELECT m.*, r.patient_name, r.urgency_level, r.city 
      FROM match_record m
      JOIN blood_request r ON m.request_id = r.request_id
      WHERE m.donor_id = ?
    `, [donorId]);

    res.status(200).json({ data: matches });
  } catch (error) {
    console.error('Fetch Matches Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
