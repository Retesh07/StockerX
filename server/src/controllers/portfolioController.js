const User = require('../models/User');
const Stock = require('../models/Stock');

const portfolioController = {
    getPortfolio: async (req, res) => {
        try {
            console.log('Fetching portfolio for user:', req.user._id);
            const user = await User.findById(req.user._id)
                .populate('portfolio.stockId');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Calculate current value and profit/loss for each position
            const portfolio = user.portfolio.map(position => {
                const currentValue = position.quantity * position.stockId.currentPrice;
                const totalCost = position.quantity * position.averageBuyPrice;
                const profitLoss = currentValue - totalCost;
                
                return {
                    stock: {
                        _id: position.stockId._id,
                        symbol: position.stockId.symbol,
                        name: position.stockId.name,
                        currentPrice: position.stockId.currentPrice
                    },
                    quantity: position.quantity,
                    averageBuyPrice: position.averageBuyPrice,
                    currentValue,
                    profitLoss
                };
            });

            console.log('Sending portfolio data:', {
                portfolioLength: portfolio.length,
                virtualBalance: user.virtualBalance
            });

            res.json({
                portfolio,
                virtualBalance: user.virtualBalance
            });
        } catch (error) {
            console.error('Portfolio fetch error:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = portfolioController; 