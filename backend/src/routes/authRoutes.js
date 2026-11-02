const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route test
router.get('/profile', verifyToken, requireRole(['DONOR']), (req, res) => {
  res.status(200).json({ message: 'Welcome to your secure profile', user: req.user });
});

module.exports = router;
