const db = require('../config/db');

exports.getInventory = async (req, res) => {
  try {
    const [inventory] = await db.query(`
      SELECT i.inventory_id, i.blood_group, i.units_available, b.bank_name 
      FROM blood_inventory i 
      JOIN blood_bank b ON i.blood_bank_id = b.blood_bank_id
    `);
    res.status(200).json({ data: inventory });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.allocateBlood = async (req, res) => {
  try {
    const { requestId, bloodBankId, bloodGroup, unitsAllocated } = req.body;
    if (!requestId || !bloodBankId || !bloodGroup || !unitsAllocated) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [inventory] = await db.query(
      'SELECT units_available FROM blood_inventory WHERE blood_bank_id = ? AND blood_group = ?',
      [bloodBankId, bloodGroup]
    );

    if (inventory.length === 0 || inventory[0].units_available < unitsAllocated) {
      return res.status(400).json({ message: 'Insufficient blood units available' });
    }

    await db.query(
      'UPDATE blood_inventory SET units_available = units_available - ? WHERE blood_bank_id = ? AND blood_group = ?',
      [unitsAllocated, bloodBankId, bloodGroup]
    );

    const [result] = await db.query(
      'INSERT INTO blood_allocation (request_id, blood_bank_id, blood_group, units_allocated, allocation_status) VALUES (?, ?, ?, ?, ?)',
      [requestId, bloodBankId, bloodGroup, unitsAllocated, 'ALLOCATED']
    );

    res.status(201).json({ message: 'Blood allocated', allocationId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
