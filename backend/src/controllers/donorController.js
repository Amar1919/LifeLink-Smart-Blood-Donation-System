const db = require('../config/db');

exports.createProfile = async (req, res) => {
  try {
    const { bloodGroup, dateOfBirth, city, state, pincode } = req.body;
    const userId = req.user.userId;

    const [existing] = await db.query('SELECT * FROM donor WHERE user_id = ?', [userId]);
    if (existing.length > 0) return res.status(400).json({ message: 'Donor profile already exists' });

    const [result] = await db.query(
      'INSERT INTO donor (user_id, blood_group, date_of_birth, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, bloodGroup, dateOfBirth, city, state, pincode]
    );

    res.status(201).json({ message: 'Donor profile created', donorId: result.insertId });
  } catch (error) {
    console.error('Donor Profile Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllDonors = async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;
    let query = `
      SELECT d.donor_id, u.first_name, u.last_name, d.blood_group, d.city, d.availability_status 
      FROM donor d 
      JOIN users u ON d.user_id = u.user_id 
      WHERE 1=1
    `;
    const params = [];

    if (bloodGroup) {
      query += ' AND d.blood_group = ?';
      params.push(bloodGroup);
    }
    if (city) {
      query += ' AND d.city = ?';
      params.push(city);
    }

    const [donors] = await db.query(query, params);
    res.status(200).json({ data: donors });
  } catch (error) {
    console.error('Fetch Donors Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
