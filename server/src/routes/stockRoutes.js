const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', stockController.getAllStocks);
router.get('/:id', stockController.getStock);

module.exports = router; 