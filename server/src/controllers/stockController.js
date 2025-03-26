const Stock = require('../models/Stock');

const stockController = {
    // Get all stocks
    getAllStocks: async (req, res) => {
        try {
            console.log('Fetching all stocks...');
            const stocks = await Stock.find();
            console.log(`Found ${stocks.length} stocks`);
            if (stocks.length > 0) {
                console.log('Sample stock:', stocks[0]);
            }
            res.json(stocks);
        } catch (error) {
            console.error('Error in getAllStocks:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get single stock
    getStock: async (req, res) => {
        try {
            const stock = await Stock.findById(req.params.id);
            if (!stock) {
                return res.status(404).json({ message: 'Stock not found' });
            }
            res.json(stock);
        } catch (error) {
            console.error('Error in getStock:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create stock (admin only in real app)
    createStock: async (req, res) => {
        try {
            const { symbol, name, currentPrice, previousClose, openPrice, dayLow, dayHigh, volume } = req.body;
            
            const stock = await Stock.create({
                symbol,
                name,
                currentPrice,
                previousClose,
                openPrice,
                dayLow,
                dayHigh,
                volume,
                priceHistory: [{
                    price: currentPrice,
                    timestamp: new Date()
                }]
            });

            res.status(201).json(stock);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update stock price (would be automated in real app)
    updateStockPrice: async (req, res) => {
        try {
            const { currentPrice } = req.body;
            const stock = await Stock.findById(req.params.id);

            if (!stock) {
                return res.status(404).json({ message: 'Stock not found' });
            }

            stock.previousClose = stock.currentPrice;
            stock.currentPrice = currentPrice;
            stock.priceHistory.push({
                price: currentPrice,
                timestamp: new Date()
            });

            await stock.save();
            res.json(stock);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = stockController; 