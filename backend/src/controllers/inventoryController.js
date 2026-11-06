
const db = require('../config/db');

// Get available blood inventory
exports.getInventory = async (req, res) => {
  try {
    const [inventory] = await db.query(`
      SELECT
        i.inventory_id,
        i.blood_bank_id,
        i.blood_group,
        i.units_available,
        b.bank_name
      FROM blood_inventory i
      JOIN blood_bank b
        ON i.blood_bank_id = b.blood_bank_id
      ORDER BY b.bank_name, i.blood_group
    `);

    return res.status(200).json({
      count: inventory.length,
      data: inventory
    });

  } catch (error) {
    console.error('Get Inventory Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


// Allocate blood safely using a database transaction
exports.allocateBlood = async (req, res) => {
  let connection;

  try {
    const {
      requestId,
      bloodBankId,
      bloodGroup,
      unitsAllocated
    } = req.body;

    // Validate required fields
    if (
      requestId === undefined ||
      bloodBankId === undefined ||
      !bloodGroup ||
      unitsAllocated === undefined
    ) {
      return res.status(400).json({
        message: 'Missing required fields'
      });
    }

    const parsedRequestId = Number(requestId);
    const parsedBloodBankId = Number(bloodBankId);
    const parsedUnits = Number(unitsAllocated);

    if (
      !Number.isInteger(parsedRequestId) ||
      parsedRequestId <= 0 ||
      !Number.isInteger(parsedBloodBankId) ||
      parsedBloodBankId <= 0 ||
      !Number.isInteger(parsedUnits) ||
      parsedUnits <= 0
    ) {
      return res.status(400).json({
        message: 'Request ID, blood bank ID and allocated units must be positive integers'
      });
    }

    const normalizedBloodGroup = String(bloodGroup).trim().toUpperCase();

    const validBloodGroups = [
      'A+', 'A-', 'B+', 'B-',
      'AB+', 'AB-', 'O+', 'O-'
    ];

    if (!validBloodGroups.includes(normalizedBloodGroup)) {
      return res.status(400).json({
        message: 'Invalid blood group'
      });
    }

    // Get a database connection
    connection = await db.getConnection();

    // Start transaction
    await connection.beginTransaction();

    // 1. Lock and validate the blood request
    const [requests] = await connection.query(
      `
      SELECT
        request_id,
        required_blood_group,
        units_required,
        status
      FROM blood_request
      WHERE request_id = ?
      FOR UPDATE
      `,
      [parsedRequestId]
    );

    if (requests.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: 'Blood request not found'
      });
    }

    const request = requests[0];

    // 2. Validate request status
    if (
      request.status === 'CANCELLED' ||
      request.status === 'FULFILLED'
    ) {
      await connection.rollback();

      return res.status(400).json({
        message: `Cannot allocate blood for a ${request.status} request`
      });
    }

    // 3. Validate requested blood group
    if (
      request.required_blood_group !== normalizedBloodGroup
    ) {
      await connection.rollback();

      return res.status(400).json({
        message: 'Blood group does not match the blood request'
      });
    }

    // 4. Calculate units already allocated to this request
    const [allocationRows] = await connection.query(
      `
      SELECT COALESCE(SUM(units_allocated), 0) AS total_allocated
      FROM blood_allocation
      WHERE request_id = ?
        AND allocation_status = 'ALLOCATED'
      `,
      [parsedRequestId]
    );

    const alreadyAllocated = Number(
      allocationRows[0].total_allocated
    );

    const requiredUnits = Number(request.units_required);
    const remainingUnits = requiredUnits - alreadyAllocated;

    // 5. Prevent over-allocation
    if (remainingUnits <= 0) {
      await connection.rollback();

      return res.status(400).json({
        message: 'This blood request has already received its required units',
        requiredUnits,
        alreadyAllocated,
        remainingUnits: 0
      });
    }

    if (parsedUnits > remainingUnits) {
      await connection.rollback();

      return res.status(400).json({
        message: 'Allocation exceeds the remaining required units',
        requiredUnits,
        alreadyAllocated,
        remainingUnits
      });
    }

    // 6. Lock inventory row
    const [inventory] = await connection.query(
      `
      SELECT inventory_id, units_available
      FROM blood_inventory
      WHERE blood_bank_id = ?
        AND blood_group = ?
      FOR UPDATE
      `,
      [parsedBloodBankId, normalizedBloodGroup]
    );

    if (inventory.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: 'Blood inventory record not found'
      });
    }

    const availableUnits = Number(inventory[0].units_available);

    // 7. Check available stock
    if (availableUnits < parsedUnits) {
      await connection.rollback();

      return res.status(400).json({
        message: 'Insufficient blood units available',
        availableUnits,
        requestedUnits: parsedUnits
      });
    }

    // 8. Deduct inventory
    await connection.query(
      `
      UPDATE blood_inventory
      SET units_available = units_available - ?
      WHERE inventory_id = ?
      `,
      [parsedUnits, inventory[0].inventory_id]
    );

    // 9. Create allocation record
    const [result] = await connection.query(
      `
      INSERT INTO blood_allocation
      (
        request_id,
        blood_bank_id,
        blood_group,
        units_allocated,
        allocation_status
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        parsedRequestId,
        parsedBloodBankId,
        normalizedBloodGroup,
        parsedUnits,
        'ALLOCATED'
      ]
    );

    // 10. Commit transaction
    await connection.commit();

    return res.status(201).json({
      message: 'Blood allocated successfully',
      allocationId: result.insertId,
      requestId: parsedRequestId,
      bloodGroup: normalizedBloodGroup,
      unitsAllocated: parsedUnits,
      remainingRequestUnits: remainingUnits - parsedUnits,
      remainingInventoryUnits: availableUnits - parsedUnits
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Allocate Blood Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};
