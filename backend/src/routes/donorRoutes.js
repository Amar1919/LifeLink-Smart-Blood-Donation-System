
const express = require('express');
const router = express.Router();

const donorController = require('../controllers/donorController');

const {
  verifyToken,
  requireRole
} = require('../middleware/authMiddleware');

// Create donor profile.
router.post(
  '/',
  verifyToken,
  requireRole(['DONOR']),
  donorController.createProfile
);

// Get logged-in donor profile.
router.get(
  '/my-profile',
  verifyToken,
  requireRole(['DONOR']),
  donorController.getMyProfile
);

// Get all donors.
router.get(
  '/',
  verifyToken,
  donorController.getAllDonors
);

// Update donor availability.
router.patch(
  '/availability',
  verifyToken,
  requireRole(['DONOR']),
  donorController.updateAvailability
);

module.exports = router;
