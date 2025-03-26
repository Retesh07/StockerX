import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import React from 'react';
import { motion } from 'framer-motion';

const Portfolio = ({ setIsCalculatorOpen }) => {
    const [portfolio, setPortfolio] = useState([]);  // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                console.log('Fetching portfolio...');
                const response = await axios.get('http://localhost:5000/api/portfolio', {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Check the structure of the response
                console.log('Raw response:', response);

                // Ensure we're setting an array
                const portfolioData = response.data.portfolio || response.data || [];
                console.log('Processed portfolio data:', portfolioData);

                // Make sure we're setting an array
                setPortfolio(Array.isArray(portfolioData) ? portfolioData : []);

            } catch (err) {
                console.error('Error fetching portfolio:', err);
                setError(err.message || 'Failed to fetch portfolio');
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, []);

    const handleCalculatorOpen = () => {
        console.log("Calculator button clicked");
        setIsCalculatorOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="text-white text-xl">Loading Portfolio...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="text-red-500 text-xl">Error: {error}</div>
            </div>
        );
    }

    // Always ensure portfolio is an array
    const portfolioArray = Array.isArray(portfolio) ? portfolio : [];

    return (
        <motion.div
            className="min-h-screen bg-gray-900 py-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="min-h-screen bg-gray-900 py-8 px-4">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold text-white">Portfolio</h1>
                        <motion.button
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCalculatorOpen}
                        >
                            Open Calculator
                        </motion.button>
                    </div>
                    {/* Portfolio Summary */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <h3 className="text-gray-400">Total Value</h3>
                                <p className="text-2xl font-bold text-green-500">
                                    ${user?.virtualBalance?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-gray-400">Positions</h3>
                                <p className="text-2xl font-bold text-white">{portfolioArray.length}</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-gray-400">Total P/L</h3>
                                <p className="text-2xl font-bold text-green-500">$0.00</p>
                            </div>
                        </div>
                    </div>

                    {/* Show message if no positions */}
                    {portfolioArray.length === 0 ? (
                        <div className="text-center text-gray-400 text-xl mt-8">
                            No positions in portfolio yet.
                        </div>
                    ) : (
                        /* Portfolio Positions */
                        <div className="space-y-4">
                            {portfolioArray.map((position) => (
                                <div
                                    key={position._id || Math.random()}
                                    className="bg-gray-800 rounded-lg p-6"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                {position.stock?.symbol || 'Unknown'}
                                            </h2>
                                            <p className="text-gray-400">{position.stock?.name || 'Unknown'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-green-500">
                                                ${position.stock?.currentPrice?.toFixed(2) || '0.00'}
                                            </p>
                                            <p className="text-gray-400">
                                                {position.quantity || 0} shares
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-between text-sm">
                                        <span className="text-gray-400">
                                            Total Value:
                                            <span className="text-green-500 ml-2">
                                                ${((position.quantity || 0) * (position.stock?.currentPrice || 0)).toFixed(2)}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Portfolio;