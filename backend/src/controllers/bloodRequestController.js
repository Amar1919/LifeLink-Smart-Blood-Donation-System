
const db = require('../config/db');
const { getSession } = require('../config/neo4j');

// Create a new blood request
exports.createRequest = async (req, res) => {
  let session;

  try {
    const {
      hospitalId,
      patientName,
      requiredBloodGroup,
      unitsRequired,
      urgencyLevel,
      city,
      state,
      pincode
    } = req.body;

    const userId = req.user.userId;

    if (
      !hospitalId ||
      !patientName ||
      !requiredBloodGroup ||
      !unitsRequired ||
      !urgencyLevel ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        message: 'Missing required fields'
      });
    }

    if (
      !Number.isInteger(Number(unitsRequired)) ||
      Number(unitsRequired) <= 0
    ) {
      return res.status(400).json({
        message: 'Units required must be a positive integer'
      });
    }

    // Verify hospital exists
    const [hospitals] = await db.query(
      `SELECT hospital_id, hospital_name, city, state
       FROM hospital
       WHERE hospital_id = ?`,
      [hospitalId]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({
        message: 'Hospital not found'
      });
    }

    const hospital = hospitals[0];

    // Insert request into MySQL
    const [result] = await db.query(
      `INSERT INTO blood_request
       (user_id, hospital_id, patient_name, required_blood_group,
        units_required, urgency_level, city, state, pincode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        hospitalId,
        patientName,
        requiredBloodGroup,
        Number(unitsRequired),
        urgencyLevel,
        city,
        state,
        pincode || null
      ]
    );

    const requestId = result.insertId;
    let neo4jSynced = false;

    // Synchronize with Neo4j
    try {
      session = getSession();

      await session.executeWrite(async (tx) => {
        await tx.run(
          `
          MERGE (r:BloodRequest {requestId: $requestId})
          SET r.patientName = $patientName,
              r.requiredBloodGroup = $requiredBloodGroup,
              r.unitsRequired = $unitsRequired,
              r.urgencyLevel = $urgencyLevel,
              r.status = 'PENDING',
              r.city = $city,
              r.state = $state

          MERGE (bg:BloodGroup {name: $requiredBloodGroup})
          MERGE (r)-[:REQUIRES]->(bg)

          MERGE (h:Hospital {hospitalId: $hospitalId})
          SET h.name = $hospitalName,
              h.city = $hospitalCity,
              h.state = $hospitalState

          MERGE (r)-[:REQUESTED_AT]->(h)

          MERGE (loc:Location {
            city: $city,
            state: $state
          })
          MERGE (r)-[:LOCATED_IN]->(loc)
          `,
          {
            requestId,
            patientName,
            requiredBloodGroup,
            unitsRequired: Number(unitsRequired),
            urgencyLevel,
            city,
            state,
            hospitalId: hospital.hospital_id,
            hospitalName: hospital.hospital_name,
            hospitalCity: hospital.city,
            hospitalState: hospital.state
          }
        );
      });

      neo4jSynced = true;

      console.log(
        `[Neo4j] Blood request ${requestId} synchronized successfully`
      );

    } catch (neo4jError) {
      console.error(
        '[Neo4j] Blood request synchronization failed:',
        neo4jError.message
      );

    } finally {
      if (session) {
        await session.close();
        session = null;
      }
    }

    return res.status(201).json({
      message: 'Blood request created successfully',
      requestId,
      mysqlSynced: true,
      neo4jSynced,
      syncMessage: neo4jSynced
        ? 'Blood request synchronized with both databases'
        : 'Blood request saved in MySQL; Neo4j synchronization needs attention'
    });

  } catch (error) {
    console.error('Request Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


// Get all pending blood requests
exports.getRequests = async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT *
       FROM blood_request
       WHERE status = ?`,
      ['PENDING']
    );

    return res.status(200).json({
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error('Fetch Requests Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


// Get requests created by the logged-in patient
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [requests] = await db.query(
      `
      SELECT
        br.*,
        h.hospital_name,
        (
          SELECT COUNT(*)
          FROM match_record mr
          WHERE mr.request_id = br.request_id
        ) AS total_matches,
        (
          SELECT COUNT(*)
          FROM match_record mr
          WHERE mr.request_id = br.request_id
            AND mr.response_status = 'PENDING'
        ) AS pending_responses,
        (
          SELECT COUNT(*)
          FROM match_record mr
          WHERE mr.request_id = br.request_id
            AND mr.response_status = 'ACCEPTED'
        ) AS accepted_responses,
        (
          SELECT COUNT(*)
          FROM match_record mr
          WHERE mr.request_id = br.request_id
            AND mr.response_status = 'REJECTED'
        ) AS rejected_responses
      FROM blood_request br
      LEFT JOIN hospital h
        ON br.hospital_id = h.hospital_id
      WHERE br.user_id = ?
      ORDER BY br.request_id DESC
      `,
      [userId]
    );

    return res.status(200).json({
      message: 'Your blood requests fetched successfully',
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error('My Requests Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


// Get donor matches and responses for a particular patient request
exports.getRequestMatches = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requestId = Number(req.params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({
        message: 'Invalid request ID'
      });
    }

    // Verify that this request belongs to the logged-in patient
    const [requests] = await db.query(
      `SELECT request_id, patient_name, required_blood_group, status
       FROM blood_request
       WHERE request_id = ? AND user_id = ?`,
      [requestId, userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: 'Blood request not found or you do not have permission to view it'
      });
    }

    // Fetch matched donors and their responses
    const [matches] = await db.query(
      `
      SELECT
        mr.match_id,
        mr.request_id,
        mr.donor_id,
        mr.match_score,
        mr.match_status,
        mr.response_status,
        mr.matched_at,
        u.first_name,
        u.last_name,
        u.email,
        d.blood_group,
        d.city,
        d.state,
        d.availability_status
      FROM match_record mr
      INNER JOIN donor d
        ON mr.donor_id = d.donor_id
      INNER JOIN users u
        ON d.user_id = u.user_id
      WHERE mr.request_id = ?
      ORDER BY mr.match_score DESC, mr.matched_at DESC
      `,
      [requestId]
    );

    return res.status(200).json({
      message: 'Request matches fetched successfully',
      request: requests[0],
      count: matches.length,
      data: matches
    });

  } catch (error) {
    console.error('Request Matches Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


// Cancel a pending blood request
exports.cancelRequest = async (req, res) => {
  let connection;
  let session;

  try {
    const userId = req.user.userId;
    const requestId = Number(req.params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({
        message: 'Invalid request ID'
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Lock the request while checking and cancelling it
    const [requests] = await connection.query(
      `
      SELECT request_id, status
      FROM blood_request
      WHERE request_id = ? AND user_id = ?
      FOR UPDATE
      `,
      [requestId, userId]
    );

    if (requests.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: 'Blood request not found or you do not have permission to cancel it'
      });
    }

    const request = requests[0];

    if (!['PENDING', 'MATCHED'].includes(request.status)) {
      await connection.rollback();

      return res.status(400).json({
        message: `This request cannot be cancelled because its current status is ${request.status}`
      });
    }

    // Do not cancel if any donor has already accepted
    const [acceptedMatches] = await connection.query(
      `
      SELECT match_id
      FROM match_record
      WHERE request_id = ?
        AND response_status = 'ACCEPTED'
      LIMIT 1
      `,
      [requestId]
    );

    if (acceptedMatches.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        message: 'This request cannot be cancelled because a donor has already accepted it'
      });
    }

    // Update MySQL
    await connection.query(
      `
      UPDATE blood_request
      SET status = 'CANCELLED'
      WHERE request_id = ?
      `,
      [requestId]
    );

    await connection.commit();

    // Synchronize cancellation status with Neo4j
    let neo4jSynced = false;

    try {
      session = getSession();

      const result = await session.executeWrite(async (tx) => {
        return tx.run(
          `
          MATCH (r:BloodRequest {requestId: $requestId})
          SET r.status = 'CANCELLED'
          RETURN r.requestId AS requestId
          `,
          { requestId }
        );
      });

      neo4jSynced = result.records.length > 0;

    } catch (neo4jError) {
      console.error(
        '[Neo4j] Request cancellation synchronization failed:',
        neo4jError.message
      );

    } finally {
      if (session) {
        await session.close();
      }
    }

    return res.status(200).json({
      message: neo4jSynced
        ? 'Blood request cancelled successfully in MySQL and Neo4j'
        : 'Blood request cancelled in MySQL, but Neo4j synchronization needs attention',
      requestId,
      status: 'CANCELLED',
      mysqlSynced: true,
      neo4jSynced
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Cancel Request Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};
