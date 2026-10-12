const User = require('../models/User');
const Stock = require('../models/Stock');
const tradingController = require('./tradingController');

const portfolioController = {
    getPortfolio: async (req, res) => {
        try {
            const user = await User.findById(req.user._id)
                .populate('portfolio.stockId');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Calculate current value and profit/loss for each position safely
            const portfolio = user.portfolio
                .filter(position => position.stockId) // guard against unpopulated or orphaned items
                .map(position => {
                    const currentPrice = position.stockId.currentPrice || 0;
                    const avgPrice = position.averageBuyPrice || currentPrice;
                    const currentValue = position.quantity * currentPrice;
                    const totalCost = position.quantity * avgPrice;
                    const profitLoss = currentValue - totalCost;
                    
                    return {
                        stock: {
                            _id: position.stockId._id,
                            symbol: position.stockId.symbol,
                            name: position.stockId.name,
                            currentPrice
                        },
                        quantity: position.quantity,
                        averageBuyPrice: avgPrice,
                        currentValue,
                        profitLoss
                    };
                });

            res.json({
                portfolio,
                virtualBalance: user.virtualBalance
            });
        } catch (error) {
            console.error('Portfolio fetch error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Delegate buy/sell to centralized atomic trading controller
    buyStock: (req, res) => tradingController.buyStock(req, res),
    sellStock: (req, res) => tradingController.sellStock(req, res)
};

module.exports = portfolioController;