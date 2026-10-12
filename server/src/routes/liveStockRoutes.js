const express = require('express');
const router = express.Router();
const liveStockController = require('../controllers/liveStockController');

// Batch live-refreshing quotes
router.get('/quotes', liveStockController.getBatchQuotes);

// Single stock quote
router.get('/quotes/:symbol', liveStockController.getQuote);

// Historical chart data for 1D, 1W, 1M timeframes
router.get('/history/:symbol', liveStockController.getHistory);

module.exports = router;
