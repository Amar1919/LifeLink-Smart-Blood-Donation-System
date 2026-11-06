
const express = require('express');
const router = express.Router();

const matchController = require('../controllers/matchController');

const {
  verifyToken,
  requireRole
} = require('../middleware/authMiddleware');

// Automatically discover compatible donors.
router.post(
  '/discover/:requestId',
  verifyToken,
  requireRole(['PATIENT', 'ADMIN']),
  matchController.discoverDonors
);

// Manually create a match.
router.post(
  '/',
  verifyToken,
  matchController.createMatch
);

// Get matches for the logged-in donor.
router.get(
  '/my-matches',
  verifyToken,
  requireRole(['DONOR']),
  matchController.getDonorMatches
);

// Donor accepts or rejects a match.
router.patch(
  '/:matchId/respond',
  verifyToken,
  requireRole(['DONOR']),
  matchController.respondToMatch
);

module.exports = router;
