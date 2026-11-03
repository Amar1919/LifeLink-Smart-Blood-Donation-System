const express = require('express');
const router = express.Router();
const bloodRequestController = require('../controllers/bloodRequestController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, bloodRequestController.createRequest);
router.get('/', verifyToken, bloodRequestController.getRequests);

module.exports = router;
