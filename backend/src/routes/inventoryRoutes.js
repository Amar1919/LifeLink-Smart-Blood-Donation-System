const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, inventoryController.getInventory);
router.post('/allocate', verifyToken, inventoryController.allocateBlood);

module.exports = router;
