const User = require('../models/User');
const Stock = require('../models/Stock');

const leaderboardController = {
    getLeaderboard: async (req, res) => {
        try {
            // Get all users with their portfolio populated with stock details
            const users = await User.find()
                .populate({
                    path: 'portfolio.stockId',
                    model: 'Stock'
                });
            
            const leaderboardData = users.map(user => {
                // Calculate total value of stocks in portfolio
                const portfolioValue = user.portfolio.reduce((total, position) => {
                    if (position.stockId) {  // Check if stockId exists and is populated
                        return total + (position.quantity * position.stockId.currentPrice);
                    }
                    return total;
                }, 0);

                // Calculate total value (portfolio + cash balance)
                const totalValue = portfolioValue + user.virtualBalance;
                
                // Calculate profit/loss
                const initialBalance = 100000; // Starting balance
                const profitLoss = totalValue - initialBalance;
                const profitLossPercentage = (profitLoss / initialBalance) * 100;

                return {
                    _id: user._id,
                    username: user.username,
                    portfolioValue: portfolioValue,
                    cashBalance: user.virtualBalance,
                    totalValue: totalValue,
                    profitLoss: profitLoss,
                    profitLossPercentage: profitLossPercentage
                };
            });

            // Sort by total value in descending order
            leaderboardData.sort((a, b) => b.totalValue - a.totalValue);

            res.json(leaderboardData);
        } catch (error) {
            console.error('Get leaderboard error:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = leaderboardController; 