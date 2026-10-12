const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, portfolioController.getPortfolio);
router.post('/buy', protect, portfolioController.buyStock);
router.post('/sell', protect, portfolioController.sellStock);

module.exports = router;