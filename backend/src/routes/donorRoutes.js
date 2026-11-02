const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, requireRole(['DONOR']), donorController.createProfile);
router.get('/', verifyToken, donorController.getAllDonors);

module.exports = router;
