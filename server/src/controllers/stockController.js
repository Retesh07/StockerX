const fs = require('fs');
const path = require('path');
const Stock = require('../models/Stock');

// In-memory fallback loaded from CSV if MongoDB is empty or down
let csvStocksFallback = null;

function loadCsvFallback() {
    if (csvStocksFallback) return csvStocksFallback;
    try {
        const csvPath = path.join(__dirname, '../../data/stocks.csv');
        if (fs.existsSync(csvPath)) {
            const content = fs.readFileSync(csvPath, 'utf8');
            const lines = content.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            csvStocksFallback = lines.slice(1).map((line, idx) => {
                const parts = line.split(',').map(p => p.trim());
                const currentPrice = parseFloat(parts[2]) || 100;
                const previousClose = parseFloat(parts[3]) || currentPrice;
                return {
                    _id: `mock-${parts[0]}`,
                    symbol: parts[0],
                    name: parts[1],
                    currentPrice,
                    previousClose,
                    openPrice: parseFloat(parts[4]) || currentPrice,
                    dayLow: parseFloat(parts[5]) || (currentPrice * 0.98),
                    dayHigh: parseFloat(parts[6]) || (currentPrice * 1.02),
                    volume: parseInt(parts[7], 10) || 1000000,
                    change: Number((currentPrice - previousClose).toFixed(2)),
                    changePercent: Number(((currentPrice - previousClose) / previousClose * 100).toFixed(2))
                };
            });
            console.log(`Loaded ${csvStocksFallback.length} stocks from CSV fallback`);
            return csvStocksFallback;
        }
    } catch (err) {
        console.error('Error loading fallback CSV:', err.message);
    }
    return [];
}

const stockController = {
    // Get all stocks with resilient fallback and Indian stock enforcement
    getAllStocks: async (req, res) => {
        try {
            const validCsvStocks = loadCsvFallback();
            const validSymbols = validCsvStocks.map(s => s.symbol.toUpperCase());
            const foreignLegacySymbols = ['AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'NVDA'];

            let stocks = [];
            try {
                // Check if MongoDB contains legacy foreign or non-Indian symbols
                const hasLegacy = await Stock.exists({
                    $or: [
                        { symbol: { $in: foreignLegacySymbols } },
                        { symbol: { $nin: validSymbols } }
                    ]
                });

                const count = await Stock.countDocuments();

                // If legacy foreign stocks are detected or DB is unseeded, sync with Indian stocks
                if (hasLegacy || count === 0) {
                    console.log('Legacy foreign stocks detected in database. Purging and syncing Indian stocks...');
                    await Stock.deleteMany({ symbol: { $nin: validSymbols } });

                    for (const item of validCsvStocks) {
                        const { _id, change, changePercent, ...stockData } = item;
                        await Stock.updateOne(
                            { symbol: stockData.symbol },
                            { $setOnInsert: stockData },
                            { upsert: true }
                        );
                    }
                }

                stocks = await Stock.find({ symbol: { $in: validSymbols } });
            } catch (dbErr) {
                console.warn('MongoDB query failed, falling back to CSV data:', dbErr.message);
            }

            // If DB returned 0 stocks or failed, use CSV seed
            if (!stocks || stocks.length === 0) {
                stocks = validCsvStocks;
            }

            res.json(stocks);
        } catch (error) {
            console.error('Error in getAllStocks:', error);
            res.json(loadCsvFallback());
        }
    },

    // Get single stock with resilient fallback
    getStock: async (req, res) => {
        try {
            const { id } = req.params;
            const validCsvStocks = loadCsvFallback();
            const validSymbols = validCsvStocks.map(s => s.symbol.toUpperCase());

            let stock = null;
            try {
                if (id && id.length === 24) {
                    stock = await Stock.findById(id);
                } else {
                    stock = await Stock.findOne({ symbol: id.replace('mock-', '').toUpperCase() });
                }
            } catch (dbErr) {
                console.warn('DB getStock failed, checking fallback:', dbErr.message);
            }

            if (!stock) {
                stock = validCsvStocks.find(s => s._id === id || s.symbol.toUpperCase() === id.toUpperCase());
            }

            // Reject legacy foreign stocks
            if (!stock || !validSymbols.includes(stock.symbol.toUpperCase())) {
                return res.status(404).json({ message: 'Stock not found' });
            }
            res.json(stock);
        } catch (error) {
            console.error('Error in getStock:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create stock
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
                volume
            });
            res.status(201).json(stock);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update stock price
    updateStockPrice: async (req, res) => {
        try {
            const { currentPrice } = req.body;
            const stock = await Stock.findById(req.params.id);
            if (!stock) return res.status(404).json({ message: 'Stock not found' });

            stock.previousClose = stock.currentPrice;
            stock.currentPrice = currentPrice;
            await stock.save();
            res.json(stock);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = stockController;