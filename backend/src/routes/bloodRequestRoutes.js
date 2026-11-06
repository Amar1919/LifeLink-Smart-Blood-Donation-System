
const express = require('express');
const router = express.Router();

const bloodRequestController = require('../controllers/bloodRequestController');

const {
  verifyToken,
  requireRole
} = require('../middleware/authMiddleware');

router.post(
  '/',
  verifyToken,
  requireRole(['PATIENT']),
  bloodRequestController.createRequest
);

router.get(
  '/',
  verifyToken,
  bloodRequestController.getRequests
);

router.get(
  '/my-requests',
  verifyToken,
  requireRole(['PATIENT']),
  bloodRequestController.getMyRequests
);

router.get(
  '/:requestId/matches',
  verifyToken,
  requireRole(['PATIENT']),
  bloodRequestController.getRequestMatches
);

router.patch(
  '/:requestId/cancel',
  verifyToken,
  requireRole(['PATIENT']),
  bloodRequestController.cancelRequest
);

module.exports = router;
