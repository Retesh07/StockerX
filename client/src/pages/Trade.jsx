import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stockService, tradingService } from '../services/api';
import { motion } from 'framer-motion';

const Trade = () => {
    const { stockId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stock, setStock] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const response = await stockService.getStock(stockId);
                setStock(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching stock:', err);
                setError('Error loading stock details');
                setLoading(false);
            }
        };

        fetchStock();
    }, [stockId]);

    const handleTrade = async (type) => {
        try {
            setError(null);
            const tradeService = type === 'buy' ? tradingService.buyStock : tradingService.sellStock;
            await tradeService(stockId, quantity);
            navigate('/portfolio');
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${type} stock`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!stock) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="text-white">Stock not found</div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-900 p-4"
        >
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">{stock.name} ({stock.symbol})</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Stock Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-300">Current Price</span>
                                <span className="text-white">${stock.currentPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Previous Close</span>
                                <span className="text-white">${stock.previousClose.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">Volume</span>
                                <span className="text-white">{stock.volume.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Trade</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-300 block mb-1">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                                />
                            </div>
                            
                            <div className="flex justify-between text-white">
                                <span>Total Cost:</span>
                                <span>${(stock.currentPrice * quantity).toFixed(2)}</span>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => handleTrade('buy')}
                                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                                >
                                    Buy
                                </button>
                                <button
                                    onClick={() => handleTrade('sell')}
                                    className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                                >
                                    Sell
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500">
                        {error}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Trade; 