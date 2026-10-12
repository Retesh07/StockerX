const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');

const tradingController = {
    /**
     * Buy stock:
     * - Server-side price only (never trust client price)
     * - Integer quantity validation (> 0)
     * - Atomic guarded update checking virtualBalance >= totalCost
     * - Prevents race conditions and double-spending
     */
    buyStock: async (req, res) => {
        try {
            const { stockId, quantity } = req.body;
            
            // 1. Quantity validation: must be a positive integer
            const parsedQty = parseInt(quantity, 10);
            if (!stockId || !Number.isInteger(parsedQty) || parsedQty <= 0) {
                return res.status(400).json({ 
                    message: 'Invalid input. Stock ID and a positive integer quantity are required.' 
                });
            }

            // 2. Fetch authoritative server-side stock price
            const stock = await Stock.findById(stockId);
            if (!stock) {
                return res.status(404).json({ message: 'Stock not found' });
            }

            const executionPrice = stock.currentPrice;
            const totalCost = executionPrice * parsedQty;

            // 3. Find current user position state
            const currentUser = await User.findById(req.user._id);
            if (!currentUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (currentUser.virtualBalance < totalCost) {
                return res.status(400).json({ 
                    message: `Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${currentUser.virtualBalance.toFixed(2)}` 
                });
            }

            const existingPosition = currentUser.portfolio.find(
                p => p.stockId && p.stockId.toString() === stockId.toString()
            );

            let updatedUser;

            if (existingPosition) {
                // Calculate new weighted average buy price
                const prevQty = existingPosition.quantity;
                const prevAvg = existingPosition.averageBuyPrice || executionPrice;
                const newQty = prevQty + parsedQty;
                const newAvg = ((prevQty * prevAvg) + totalCost) / newQty;

                // Atomic guarded update: deduct balance and update existing position
                updatedUser = await User.findOneAndUpdate(
                    {
                        _id: req.user._id,
                        virtualBalance: { $gte: totalCost },
                        'portfolio.stockId': stock._id
                    },
                    {
                        $inc: { virtualBalance: -totalCost },
                        $set: {
                            'portfolio.$.quantity': newQty,
                            'portfolio.$.averageBuyPrice': newAvg
                        }
                    },
                    { new: true }
                );
            } else {
                // Atomic guarded update: deduct balance and push new position
                updatedUser = await User.findOneAndUpdate(
                    {
                        _id: req.user._id,
                        virtualBalance: { $gte: totalCost }
                    },
                    {
                        $inc: { virtualBalance: -totalCost },
                        $push: {
                            portfolio: {
                                stockId: stock._id,
                                quantity: parsedQty,
                                averageBuyPrice: executionPrice
                            }
                        }
                    },
                    { new: true }
                );
            }

            // If updatedUser is null, balance changed concurrently before write completed
            if (!updatedUser) {
                return res.status(400).json({ message: 'Insufficient funds. Trade rejected.' });
            }

            // 4. Record transaction log
            const transaction = await Transaction.create({
                userId: req.user._id,
                stockId: stock._id,
                type: 'buy',
                quantity: parsedQty,
                price: executionPrice,
                total: totalCost
            });

            res.status(200).json({
                message: `Successfully purchased ${parsedQty} share(s) of ${stock.symbol}`,
                transaction,
                user: {
                    virtualBalance: updatedUser.virtualBalance,
                    portfolio: updatedUser.portfolio
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

    /**
     * Sell stock:
     * - Server-side price only
     * - Integer quantity validation (> 0)
     * - Atomic guarded update checking portfolio.quantity >= quantity
     * - Strictly prevents overselling and race conditions
     */
    sellStock: async (req, res) => {
        try {
            const { stockId, quantity } = req.body;
            
            // 1. Quantity validation
            const parsedQty = parseInt(quantity, 10);
            if (!stockId || !Number.isInteger(parsedQty) || parsedQty <= 0) {
                return res.status(400).json({ 
                    message: 'Invalid input. Stock ID and a positive integer quantity are required.' 
                });
            }

            // 2. Fetch authoritative server-side stock price
            const stock = await Stock.findById(stockId);
            if (!stock) {
                return res.status(404).json({ message: 'Stock not found' });
            }

            const executionPrice = stock.currentPrice;
            const totalProceeds = executionPrice * parsedQty;

            // 3. Verify user holding
            const currentUser = await User.findById(req.user._id);
            if (!currentUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            const position = currentUser.portfolio.find(
                p => p.stockId && p.stockId.toString() === stockId.toString()
            );

            if (!position || position.quantity < parsedQty) {
                const available = position ? position.quantity : 0;
                return res.status(400).json({ 
                    message: `Insufficient shares to sell. Available: ${available}, Requested: ${parsedQty}` 
                });
            }

            let updatedUser;

            if (position.quantity === parsedQty) {
                // Selling entire position: pull element atomically guarded by quantity >= parsedQty
                updatedUser = await User.findOneAndUpdate(
                    {
                        _id: req.user._id,
                        portfolio: {
                            $elemMatch: {
                                stockId: stock._id,
                                quantity: { $gte: parsedQty }
                            }
                        }
                    },
                    {
                        $inc: { virtualBalance: totalProceeds },
                        $pull: { portfolio: { stockId: stock._id } }
                    },
                    { new: true }
                );
            } else {
                // Partial sale: decrement quantity atomically guarded by quantity >= parsedQty
                updatedUser = await User.findOneAndUpdate(
                    {
                        _id: req.user._id,
                        portfolio: {
                            $elemMatch: {
                                stockId: stock._id,
                                quantity: { $gte: parsedQty }
                            }
                        }
                    },
                    {
                        $inc: {
                            virtualBalance: totalProceeds,
                            'portfolio.$.quantity': -parsedQty
                        }
                    },
                    { new: true }
                );
            }

            // If null, shares were sold concurrently by another request
            if (!updatedUser) {
                return res.status(400).json({ message: 'Insufficient shares to sell. Overselling prevented.' });
            }

            // 4. Record transaction log
            const transaction = await Transaction.create({
                userId: req.user._id,
                stockId: stock._id,
                type: 'sell',
                quantity: parsedQty,
                price: executionPrice,
                total: totalProceeds
            });

            res.status(200).json({
                message: `Successfully sold ${parsedQty} share(s) of ${stock.symbol}`,
                transaction,
                user: {
                    virtualBalance: updatedUser.virtualBalance,
                    portfolio: updatedUser.portfolio
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