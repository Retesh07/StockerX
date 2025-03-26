import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stockService, tradingService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Trading = () => {
    const { stockId } = useParams();
    const navigate = useNavigate();
    const { user, updateUserBalance } = useAuth();
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
            
            if (!stock || !quantity) {
                setError('Please select a stock and quantity');
                return;
            }

            const tradeData = {
                stockId: stock._id,
                quantity: parseInt(quantity)
            };

            console.log(`Attempting to ${type} stock:`, tradeData); // Debug log

            const response = await (type === 'buy' 
                ? tradingService.buyStock(tradeData.stockId, tradeData.quantity)
                : tradingService.sellStock(tradeData.stockId, tradeData.quantity));

            console.log('Trade response:', response); // Debug log

            if (response.data.user) {
                updateUserBalance(response.data.user.virtualBalance);
            }

            alert(`Stock ${type === 'buy' ? 'purchased' : 'sold'} successfully!`);
            navigate('/portfolio');
        } catch (err) {
            console.error(`Error ${type}ing stock:`, err);
            setError(err.response?.data?.message || `Error ${type}ing stock. Please try again.`);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!stock) return <div>Stock not found</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="bg-gray-800 rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4">{stock.name} ({stock.symbol})</h1>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-gray-400">Current Price</p>
                        <p className="text-xl">${stock.currentPrice}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Quantity</p>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-gray-700 p-2 rounded w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-gray-400">Total Cost</p>
                        <p className="text-xl">${(stock.currentPrice * quantity).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Your Balance</p>
                        <p className="text-xl">${user?.virtualBalance.toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={() => handleTrade('buy')}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
                    >
                        Buy
                    </button>
                    <button
                        onClick={() => handleTrade('sell')}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
                    >
                        Sell
                    </button>
                </div>

                {error && (
                    <div className="mt-4 text-red-500">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Trading; 