const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const liveStockController = require('../controllers/liveStockController');

// Live-refreshing quotes with 15s cache
router.get('/quotes', liveStockController.getBatchQuotes);
router.get('/quotes/:symbol', liveStockController.getQuote);

// Historical chart data
router.get('/history/:symbol', liveStockController.getHistory);

// Static / DB stocks
router.get('/', stockController.getAllStocks);
router.get('/:id', stockController.getStock);

module.exports = router;