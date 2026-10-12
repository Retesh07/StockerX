const { getQuote, getBatchQuotes, getHistoricalData, CACHE_TTL_MS } = require('../services/quoteCacheService');
const Stock = require('../models/Stock');

const liveStockController = {
    // Get single live-refreshing quote
    getQuote: async (req, res) => {
        try {
            const { symbol } = req.params;
            const quote = await getQuote(symbol.toUpperCase());
            if (!quote) {
                return res.status(404).json({ message: 'Stock not found' });
            }
            res.json(quote);
        } catch (error) {
            console.error('Error in getQuote:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Batch live-refreshing quotes for all stocks or requested symbols
    getBatchQuotes: async (req, res) => {
        try {
            let symbols = req.query.symbols ? req.query.symbols.split(',') : null;
            if (!symbols || symbols.length === 0) {
                const stocks = await Stock.find().select('symbol');
                symbols = stocks.map(s => s.symbol);
            }

            const quotes = await getBatchQuotes(symbols);
            res.json({
                quotes,
                ttlSeconds: CACHE_TTL_MS / 1000,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getBatchQuotes:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get historical data for chart with 1D/1W/1M timeframe
    getHistory: async (req, res) => {
        try {
            const { symbol } = req.params;
            const timeframe = (req.query.timeframe || '1D').toUpperCase();
            const history = await getHistoricalData(symbol.toUpperCase(), timeframe);
            res.json(history);
        } catch (error) {
            console.error('Error in getHistory:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = liveStockController;
