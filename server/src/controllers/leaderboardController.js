const User = require('../models/User');
const Stock = require('../models/Stock');

const leaderboardController = {
    getLeaderboard: async (req, res) => {
        try {
            // Get all users with their portfolio populated with stock details (exclude sensitive password hash)
            const users = await User.find()
                .select('username virtualBalance portfolio')
                .populate({
                    path: 'portfolio.stockId',
                    model: 'Stock',
                    select: 'symbol name currentPrice'
                });
            
            const initialBalance = 100000; // Starting virtual balance in INR

            const leaderboardData = users.map(user => {
                const cashBalance = typeof user.virtualBalance === 'number' ? user.virtualBalance : initialBalance;

                // Calculate total value of stocks in portfolio safely
                const portfolioValue = (user.portfolio || []).reduce((total, position) => {
                    if (position && position.stockId) {
                        const price = typeof position.stockId.currentPrice === 'number' ? position.stockId.currentPrice : 0;
                        const qty = typeof position.quantity === 'number' ? position.quantity : 0;
                        return total + (qty * price);
                    }
                    return total;
                }, 0);

                // Calculate total net worth (portfolio holdings + cash balance)
                const totalValue = portfolioValue + cashBalance;
                
                // Calculate profit/loss against ₹100,000 baseline
                const profitLoss = totalValue - initialBalance;
                const profitLossPercentage = initialBalance > 0 ? (profitLoss / initialBalance) * 100 : 0;

                return {
                    _id: user._id,
                    username: user.username || 'Anonymous Trader',
                    portfolioValue: Number(portfolioValue.toFixed(2)),
                    cashBalance: Number(cashBalance.toFixed(2)),
                    totalValue: Number(totalValue.toFixed(2)),
                    profitLoss: Number(profitLoss.toFixed(2)),
                    profitLossPercentage: Number(profitLossPercentage.toFixed(2))
                };
            });

            // Sort by total net equity in descending order (highest value first)
            leaderboardData.sort((a, b) => b.totalValue - a.totalValue);

            res.json(leaderboardData);
        } catch (error) {
            console.error('Get leaderboard error:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = leaderboardController; 