const Transaction = require('../models/Transaction');

const transactionController = {
    getTransactions: async (req, res) => {
        try {
            const transactions = await Transaction.find({ userId: req.user._id })
                .populate('stockId')
                .sort({ timestamp: -1 });

            const formattedTransactions = transactions.map(t => ({
                _id: t._id,
                type: t.type,
                quantity: t.quantity,
                price: t.price,
                total: t.total,
                timestamp: t.timestamp,
                stock: {
                    symbol: t.stockId.symbol,
                    name: t.stockId.name
                }
            }));

            res.json(formattedTransactions);
        } catch (error) {
            console.error('Get transactions error:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = transactionController; 