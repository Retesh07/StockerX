const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');

const tradingController = {
    buyStock: async (req, res) => {
        try {
            const { stockId, quantity } = req.body;
            
            // Input validation
            if (!stockId || !quantity || quantity <= 0) {
                return res.status(400).json({ 
                    message: 'Invalid input. Stock ID and positive quantity are required.' 
                });
            }

            // Find stock and validate
            const stock = await Stock.findById(stockId);
            if (!stock) {
                return res.status(404).json({ message: 'Stock not found' });
            }

            // Find user and validate
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const totalCost = stock.currentPrice * quantity;

            // Check if user has enough balance
            if (user.virtualBalance < totalCost) {
                return res.status(400).json({ message: 'Insufficient funds' });
            }

            // Update portfolio
            const existingPosition = user.portfolio.find(
                position => position.stockId.toString() === stockId
            );

            if (existingPosition) {
                // Update existing position
                const newQuantity = existingPosition.quantity + parseInt(quantity);
                const newAverageBuyPrice = (
                    (existingPosition.quantity * existingPosition.averageBuyPrice + 
                     quantity * stock.currentPrice) / newQuantity
                );
                
                existingPosition.quantity = newQuantity;
                existingPosition.averageBuyPrice = newAverageBuyPrice;
            } else {
                // Add new position
                user.portfolio.push({
                    stockId: stock._id,
                    quantity: parseInt(quantity),
                    averageBuyPrice: stock.currentPrice
                });
            }

            // Update user's balance
            user.virtualBalance -= totalCost;

            // Create transaction record
            const transaction = new Transaction({
                userId: user._id,
                stockId: stock._id,
                type: 'buy',
                quantity: parseInt(quantity),
                price: stock.currentPrice,
                total: totalCost
            });

            // Save all changes
            await Promise.all([
                user.save(),
                transaction.save()
            ]);

            res.status(200).json({
                message: 'Stock purchased successfully',
                transaction,
                user: {
                    virtualBalance: user.virtualBalance,
                    portfolio: user.portfolio
                }
            });

        } catch (error) {
            console.error('Buy stock error:', error);
            res.status(500).json({ 
                message: 'An error occurred while processing your purchase',
                error: error.message 
            });
        }
    },

    sellStock: async (req, res) => {
        try {
            const { stockId, quantity } = req.body;
            
            // Input validation
            if (!stockId || !quantity || quantity <= 0) {
                return res.status(400).json({ 
                    message: 'Invalid input. Stock ID and positive quantity are required.' 
                });
            }

            // Find stock and validate
            const stock = await Stock.findById(stockId);
            if (!stock) {
                return res.status(404).json({ message: 'Stock not found' });
            }

            // Find user and validate
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find the position in user's portfolio
            const position = user.portfolio.find(
                pos => pos.stockId.toString() === stockId
            );

            if (!position || position.quantity < quantity) {
                return res.status(400).json({ 
                    message: 'Insufficient stocks to sell' 
                });
            }

            const totalValue = stock.currentPrice * quantity;

            // Update portfolio
            position.quantity -= parseInt(quantity);
            
            // Remove position if quantity becomes 0
            if (position.quantity === 0) {
                user.portfolio = user.portfolio.filter(
                    pos => pos.stockId.toString() !== stockId
                );
            }

            // Update balance
            user.virtualBalance += totalValue;

            // Create transaction record
            const transaction = new Transaction({
                userId: user._id,
                stockId: stock._id,
                type: 'sell',
                quantity: parseInt(quantity),
                price: stock.currentPrice,
                total: totalValue
            });

            // Save all changes
            await Promise.all([
                user.save(),
                transaction.save()
            ]);

            res.status(200).json({
                message: 'Stock sold successfully',
                transaction,
                user: {
                    virtualBalance: user.virtualBalance,
                    portfolio: user.portfolio
                }
            });

        } catch (error) {
            console.error('Sell stock error:', error);
            res.status(500).json({ 
                message: 'An error occurred while processing your sale',
                error: error.message 
            });
        }
    }
};

module.exports = tradingController; 