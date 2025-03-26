const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/tradingController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to all routes
router.use(protect);

router.post('/buy', tradingController.buyStock);
router.post('/sell', tradingController.sellStock);

module.exports = router; 