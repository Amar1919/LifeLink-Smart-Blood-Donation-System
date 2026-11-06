
const db = require('../config/db');
const { getSession } = require('../config/neo4j');

const compatibilityMap = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

function normalizeCity(city) {
  const value = String(city || '').trim().toLowerCase();

  if (value === 'bangalore' || value === 'bengaluru') {
    return 'bengaluru';
  }

  return value;
}

function calculateMatchScore(request, donor) {
  const exactBloodGroup =
    request.required_blood_group === donor.bloodGroup;

  const sameCity =
    normalizeCity(request.city) === normalizeCity(donor.city);

  let score = exactBloodGroup ? 70 : 60;

  if (sameCity) {
    score += 30;
  }

  return score;
}


// ------------------------------------------------------------
// AUTOMATIC GRAPH-BASED DONOR DISCOVERY
// POST /api/matches/discover/:requestId
// ------------------------------------------------------------

exports.discoverDonors = async (req, res) => {
  let session;
  let connection;

  try {
    const requestId = Number(req.params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({
        message: 'Invalid blood request ID'
      });
    }

    const [requests] = await db.query(
      `SELECT *
       FROM blood_request
       WHERE request_id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: 'Blood request not found'
      });
    }

    const request = requests[0];

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        message: 'Only pending blood requests can be matched'
      });
    }

    const compatibleGroups =
      compatibilityMap[request.required_blood_group];

    if (!compatibleGroups) {
      return res.status(400).json({
        message: 'Unsupported blood group'
      });
    }

    session = getSession();

    const graphResult = await session.executeRead(async (tx) => {
      return tx.run(
        `
        MATCH (d:Donor)
        WHERE d.available = true
          AND d.bloodGroup IN $compatibleGroups

        RETURN
          d.donorId AS donorId,
          d.name AS name,
          d.bloodGroup AS bloodGroup,
          d.city AS city,
          d.state AS state
        `,
        { compatibleGroups }
      );
    });

    const graphDonors = graphResult.records.map((record) => ({
      donorId: Number(record.get('donorId')),
      name: record.get('name'),
      bloodGroup: record.get('bloodGroup'),
      city: record.get('city'),
      state: record.get('state')
    }));

    if (graphDonors.length === 0) {
      return res.status(200).json({
        message: 'No compatible available donors found',
        requestId,
        totalCandidates: 0,
        createdMatches: 0,
        data: []
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [lockedRequests] = await connection.query(
      `SELECT *
       FROM blood_request
       WHERE request_id = ?
       FOR UPDATE`,
      [requestId]
    );

    if (
      lockedRequests.length === 0 ||
      lockedRequests[0].status !== 'PENDING'
    ) {
      await connection.rollback();

      return res.status(400).json({
        message: 'Blood request is no longer pending'
      });
    }

    const currentRequest = lockedRequests[0];

    const donorIds = [
      ...new Set(
        graphDonors
          .map((donor) => donor.donorId)
          .filter((id) => Number.isInteger(id) && id > 0)
      )
    ];

    if (donorIds.length === 0) {
      await connection.commit();

      return res.status(200).json({
        message: 'No valid donor IDs found',
        requestId,
        totalCandidates: 0,
        createdMatches: 0,
        data: []
      });
    }

    const placeholders = donorIds.map(() => '?').join(',');

    const [validDonors] = await connection.query(
      `
      SELECT
        d.donor_id,
        d.blood_group,
        d.availability_status,
        d.city,
        d.state,
        u.first_name,
        u.last_name
      FROM donor d
      JOIN users u ON d.user_id = u.user_id
      WHERE d.donor_id IN (${placeholders})
        AND d.availability_status = 1
      `,
      donorIds
    );

    const validCandidates = validDonors
      .filter((donor) =>
        compatibleGroups.includes(donor.blood_group)
      )
      .map((donor) => {
        const candidate = {
          donorId: donor.donor_id,
          name: `${donor.first_name} ${donor.last_name}`,
          bloodGroup: donor.blood_group,
          city: donor.city,
          state: donor.state
        };

        candidate.matchScore = calculateMatchScore(
          currentRequest,
          candidate
        );

        return candidate;
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    const createdMatches = [];
    const existingMatches = [];

    for (const donor of validCandidates) {
      const [existing] = await connection.query(
        `
        SELECT match_id
        FROM match_record
        WHERE request_id = ? AND donor_id = ?
        LIMIT 1
        `,
        [requestId, donor.donorId]
      );

      if (existing.length > 0) {
        existingMatches.push(donor.donorId);
        continue;
      }

      const [result] = await connection.query(
        `
        INSERT INTO match_record
          (request_id, donor_id, match_score,
           match_status, response_status)
        VALUES (?, ?, ?, 'SUGGESTED', 'PENDING')
        `,
        [requestId, donor.donorId, donor.matchScore]
      );

      createdMatches.push({
        matchId: result.insertId,
        ...donor,
        matchStatus: 'SUGGESTED',
        responseStatus: 'PENDING'
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Donor discovery completed successfully',
      requestId,
      requiredBloodGroup: currentRequest.required_blood_group,
      compatibleBloodGroups: compatibleGroups,
      totalGraphCandidates: graphDonors.length,
      validCandidates: validCandidates.length,
      createdMatches: createdMatches.length,
      alreadyMatched: existingMatches.length,
      data: createdMatches
    });

  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    console.error('Donor Discovery Error:', error);

    return res.status(500).json({
      message: 'Donor discovery failed',
      error: error.message
    });

  } finally {
    if (session) {
      await session.close();
    }

    if (connection) {
      connection.release();
    }
  }
};


// ------------------------------------------------------------
// MANUAL MATCH CREATION
// POST /api/matches
// ------------------------------------------------------------

exports.createMatch = async (req, res) => {
  try {
    const { requestId, donorId, matchScore } = req.body;

    if (!requestId || !donorId) {
      return res.status(400).json({
        message: 'Request ID and Donor ID are required'
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO match_record
        (request_id, donor_id, match_score,
         match_status, response_status)
      VALUES (?, ?, ?, 'SUGGESTED', 'PENDING')
      `,
      [requestId, donorId, matchScore ?? 99.99]
    );

    return res.status(201).json({
      message: 'Match record created successfully',
      matchId: result.insertId
    });

  } catch (error) {
    console.error('Match Creation Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


// ------------------------------------------------------------
// GET MATCHES FOR LOGGED-IN DONOR
// GET /api/matches/my-matches
// ------------------------------------------------------------

exports.getDonorMatches = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [donors] = await db.query(
      'SELECT donor_id FROM donor WHERE user_id = ?',
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({
        message: 'Donor profile not found for this user'
      });
    }

    const donorId = donors[0].donor_id;

    const [matches] = await db.query(
      `
      SELECT
        m.*,
        r.patient_name,
        r.required_blood_group,
        r.units_required,
        r.urgency_level,
        r.city
      FROM match_record m
      JOIN blood_request r
        ON m.request_id = r.request_id
      WHERE m.donor_id = ?
      ORDER BY m.matched_at DESC
      `,
      [donorId]
    );

    return res.status(200).json({
      data: matches
    });

  } catch (error) {
    console.error('Fetch Matches Error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


// ------------------------------------------------------------
// DONOR ACCEPT OR REJECT MATCH
// PATCH /api/matches/:matchId/respond
// ------------------------------------------------------------

exports.respondToMatch = async (req, res) => {
  let connection;

  try {
    const matchId = Number(req.params.matchId);
    const { response } = req.body;
    const userId = req.user.userId;

    if (!Number.isInteger(matchId) || matchId <= 0) {
      return res.status(400).json({
        message: 'Invalid match ID'
      });
    }

    const normalizedResponse =
      String(response || '').trim().toUpperCase();

    if (!['ACCEPTED', 'REJECTED'].includes(normalizedResponse)) {
      return res.status(400).json({
        message: 'Response must be ACCEPTED or REJECTED'
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Find and lock this match only if it belongs to this donor.
    const [matches] = await connection.query(
      `
      SELECT
        m.match_id,
        m.match_status,
        m.response_status,
        m.donor_id
      FROM match_record m
      JOIN donor d ON m.donor_id = d.donor_id
      WHERE m.match_id = ?
        AND d.user_id = ?
      FOR UPDATE
      `,
      [matchId, userId]
    );

    if (matches.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: 'Match not found for this donor'
      });
    }

    const match = matches[0];

    if (
      match.response_status !== 'PENDING' ||
      match.match_status !== 'SUGGESTED'
    ) {
      await connection.rollback();

      return res.status(409).json({
        message: 'You have already responded to this match',
        currentResponse: match.response_status
      });
    }

    // Update both status columns.
    await connection.query(
      `
      UPDATE match_record
      SET match_status = ?,
          response_status = ?
      WHERE match_id = ?
      `,
      [
        normalizedResponse,
        normalizedResponse,
        matchId
      ]
    );

    await connection.commit();

    return res.status(200).json({
      message: `Match ${normalizedResponse.toLowerCase()} successfully`,
      matchId,
      donorId: match.donor_id,
      matchStatus: normalizedResponse,
      responseStatus: normalizedResponse
    });

  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    console.error('Match Response Error:', error);

    return res.status(500).json({
      message: 'Unable to update match response'
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};
