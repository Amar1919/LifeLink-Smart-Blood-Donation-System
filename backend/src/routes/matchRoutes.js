const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, matchController.createMatch);
router.get('/my-matches', verifyToken, matchController.getDonorMatches);

module.exports = router;
