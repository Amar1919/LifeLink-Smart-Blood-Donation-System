
const db = require('../config/db');
const { getSession } = require('../config/neo4j');

function toBoolean(value) {
  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    String(value).toUpperCase() === 'TRUE'
  );
}

// ------------------------------------------------------------
// CREATE DONOR PROFILE
// POST /api/donors
// ------------------------------------------------------------

exports.createProfile = async (req, res) => {
  let session;

  try {
    const {
      bloodGroup,
      dateOfBirth,
      city,
      state,
      pincode
    } = req.body;

    const userId = req.user.userId;

    if (!bloodGroup || !dateOfBirth || !city || !state) {
      return res.status(400).json({
        message: 'Blood group, date of birth, city and state are required'
      });
    }

    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    if (!validGroups.includes(bloodGroup)) {
      return res.status(400).json({
        message: 'Invalid blood group'
      });
    }

    const [existing] = await db.query(
      'SELECT donor_id FROM donor WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Donor profile already exists'
      });
    }

    const [result] = await db.query(
      `INSERT INTO donor
       (user_id, blood_group, date_of_birth, city, state, pincode)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        bloodGroup,
        dateOfBirth,
        city,
        state,
        pincode || null
      ]
    );

    const donorId = result.insertId;

    const [donors] = await db.query(
      `SELECT
        d.donor_id,
        d.blood_group,
        d.city,
        d.state,
        d.pincode,
        d.availability_status,
        u.first_name,
        u.last_name
       FROM donor d
       JOIN users u ON d.user_id = u.user_id
       WHERE d.donor_id = ?`,
      [donorId]
    );

    const donor = donors[0];
    const available = toBoolean(donor.availability_status);

    let neo4jSynced = false;

    try {
      session = getSession();

      await session.executeWrite(async (tx) => {
        await tx.run(
          `
          MERGE (d:Donor {donorId: $donorId})
          SET d.name = $name,
              d.bloodGroup = $bloodGroup,
              d.available = $available,
              d.city = $city,
              d.state = $state

          MERGE (bg:BloodGroup {name: $bloodGroup})
          MERGE (d)-[:HAS_BLOOD_GROUP]->(bg)

          MERGE (loc:Location {
            city: $city,
            state: $state
          })
          MERGE (d)-[:LOCATED_IN]->(loc)
          `,
          {
            donorId,
            name: `${donor.first_name} ${donor.last_name}`,
            bloodGroup: donor.blood_group,
            available,
            city: donor.city,
            state: donor.state
          }
        );
      });

      neo4jSynced = true;

      console.log(`[Neo4j] Donor ${donorId} synchronized successfully`);
    } catch (neo4jError) {
      console.error(
        '[Neo4j] Donor synchronization failed:',
        neo4jError.message
      );
    } finally {
      if (session) {
        await session.close();
        session = null;
      }
    }

    return res.status(201).json({
      message: 'Donor profile created successfully',
      donorId,
      mysqlSynced: true,
      neo4jSynced,
      syncMessage: neo4jSynced
        ? 'Donor synchronized successfully'
        : 'Donor saved in MySQL; Neo4j synchronization is pending'
    });
  } catch (error) {
    console.error('Donor Profile Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  } finally {
    if (session) {
      await session.close().catch(() => {});
    }
  }
};


// ------------------------------------------------------------
// GET LOGGED-IN DONOR PROFILE
// GET /api/donors/my-profile
// ------------------------------------------------------------

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [donors] = await db.query(
      `SELECT
        d.donor_id,
        d.user_id,
        d.blood_group,
        d.date_of_birth,
        d.city,
        d.state,
        d.pincode,
        d.availability_status,
        u.first_name,
        u.last_name,
        u.email
       FROM donor d
       JOIN users u ON d.user_id = u.user_id
       WHERE d.user_id = ?
       LIMIT 1`,
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({
        message: 'Donor profile not found. Please register as a donor first.'
      });
    }

    const donor = donors[0];

    return res.status(200).json({
      data: {
        donorId: donor.donor_id,
        userId: donor.user_id,
        firstName: donor.first_name,
        lastName: donor.last_name,
        fullName: `${donor.first_name} ${donor.last_name}`,
        email: donor.email,
        bloodGroup: donor.blood_group,
        dateOfBirth: donor.date_of_birth,
        city: donor.city,
        state: donor.state,
        pincode: donor.pincode,
        available: toBoolean(donor.availability_status)
      }
    });
  } catch (error) {
    console.error('Get Donor Profile Error:', error);

    return res.status(500).json({
      message: 'Unable to fetch donor profile'
    });
  }
};


// ------------------------------------------------------------
// GET ALL DONORS
// GET /api/donors
// ------------------------------------------------------------

exports.getAllDonors = async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    let query = `
      SELECT
        d.donor_id,
        u.first_name,
        u.last_name,
        d.blood_group,
        d.city,
        d.state,
        d.availability_status
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

    return res.status(200).json({
      data: donors
    });
  } catch (error) {
    console.error('Fetch Donors Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


// ------------------------------------------------------------
// UPDATE DONOR AVAILABILITY
// PATCH /api/donors/availability
// ------------------------------------------------------------

exports.updateAvailability = async (req, res) => {
  let session;

  try {
    const { available } = req.body;
    const userId = req.user.userId;

    if (typeof available !== 'boolean') {
      return res.status(400).json({
        message: 'Available must be either true or false'
      });
    }

    const [donors] = await db.query(
      `SELECT
        d.donor_id,
        d.blood_group,
        d.city,
        d.state,
        d.availability_status,
        u.first_name,
        u.last_name
       FROM donor d
       JOIN users u ON d.user_id = u.user_id
       WHERE d.user_id = ?`,
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({
        message: 'Donor profile not found'
      });
    }

    const donor = donors[0];
    const donorId = donor.donor_id;
    const mysqlAvailability = available ? 1 : 0;

    await db.query(
      `UPDATE donor
       SET availability_status = ?
       WHERE donor_id = ?`,
      [mysqlAvailability, donorId]
    );

    console.log(
      `[MySQL] Donor ${donorId} availability updated to ${available}`
    );

    try {
      session = getSession();

      await session.executeWrite(async (tx) => {
        await tx.run(
          `
          MERGE (d:Donor {donorId: $donorId})
          SET d.name = $name,
              d.bloodGroup = $bloodGroup,
              d.available = $available,
              d.city = $city,
              d.state = $state

          MERGE (bg:BloodGroup {name: $bloodGroup})
          MERGE (d)-[:HAS_BLOOD_GROUP]->(bg)

          MERGE (loc:Location {
            city: $city,
            state: $state
          })
          MERGE (d)-[:LOCATED_IN]->(loc)
          `,
          {
            donorId,
            name: `${donor.first_name} ${donor.last_name}`,
            bloodGroup: donor.blood_group,
            available,
            city: donor.city,
            state: donor.state
          }
        );
      });

      console.log(
        `[Neo4j] Donor ${donorId} availability synchronized`
      );

      return res.status(200).json({
        message: 'Donor availability updated successfully',
        donorId,
        availability: available,
        mysqlSynced: true,
        neo4jSynced: true
      });
    } catch (neo4jError) {
      console.error(
        '[Neo4j] Availability synchronization failed:',
        neo4jError.message
      );

      return res.status(202).json({
        message: 'Availability updated in MySQL, but Neo4j synchronization is pending',
        donorId,
        availability: available,
        mysqlSynced: true,
        neo4jSynced: false
      });
    } finally {
      if (session) {
        await session.close();
        session = null;
      }
    }
  } catch (error) {
    console.error('Update Availability Error:', error);

    return res.status(500).json({
      message: 'Unable to update donor availability'
    });
  } finally {
    if (session) {
      await session.close().catch(() => {});
    }
  }
};
