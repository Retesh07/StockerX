import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Trophy SVG Component
const TrophySVG = ({ className, color }) => (
    <motion.svg
        className={className}
        viewBox="0 0 24 24"
        fill={color}
        initial={{ scale: 1 }}
        animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
    >
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/>
    </motion.svg>
);

// Medal SVG Component
const MedalSVG = ({ className, color }) => (
    <motion.svg
        className={className}
        viewBox="0 0 24 24"
        fill={color}
        initial={{ scale: 1 }}
        animate={{ 
            scale: [1, 1.1, 1],
            y: [0, -3, 0]
        }}
        transition={{ duration: 3, repeat: Infinity }}
    >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </motion.svg>
);

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                console.log('Fetching leaderboard data...');
                const response = await axios.get('http://localhost:5000/api/leaderboard', {
                    withCredentials: true
                });
                console.log('Leaderboard response:', response.data);
                
                const sortedLeaderboard = Array.isArray(response.data) 
                    ? [...response.data].sort((a, b) => (b.portfolioValue || 0) - (a.portfolioValue || 0))
                    : [];
                
                setLeaderboard(sortedLeaderboard);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    console.log('Current state:', { loading, error, leaderboard });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white text-xl"
                >
                    Loading leaderboard...
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xl"
                >
                    Error: {error}
                </motion.div>
            </div>
        );
    }

    if (!leaderboard || leaderboard.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white text-xl"
                >
                    No leaderboard data available.
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            className="min-h-screen bg-gray-900 py-8 px-4 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={`decoration-${i}`}
                        className="absolute"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.1, 0.3, 0.1],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                        }}
                    >
                        {i % 2 === 0 ? (
                            <TrophySVG 
                                className="w-8 h-8" 
                                color={i % 4 === 0 ? '#FCD34D' : '#9CA3AF'}
                            />
                        ) : (
                            <MedalSVG 
                                className="w-6 h-6" 
                                color={i % 4 === 0 ? '#FCD34D' : '#9CA3AF'}
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="container mx-auto relative z-10">
                <motion.h1 
                    className="text-3xl font-bold text-white mb-6 text-center"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
                        Leaderboard
                    </span>
                </motion.h1>
                
                <motion.div 
                    className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="px-4 py-3 text-left text-white">Rank</th>
                                <th className="px-4 py-3 text-left text-white">Trader</th>
                                <th className="px-4 py-3 text-right text-white">Portfolio Value</th>
                                <th className="px-4 py-3 text-right text-white">Cash Balance</th>
                                <th className="px-4 py-3 text-right text-white">Total Value</th>
                                <th className="px-4 py-3 text-right text-white">Profit/Loss</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((trader, index) => (
                                <motion.tr 
                                    key={trader._id}
                                    className={`border-t border-gray-700/50 ${
                                        trader._id === currentUser?._id ? 'bg-blue-900/20' : ''
                                    } ${
                                        index === 0 ? 'bg-yellow-900/20' :
                                        index === 1 ? 'bg-gray-600/20' :
                                        index === 2 ? 'bg-yellow-800/20' : ''
                                    }`}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ 
                                        scale: 1.01,
                                        backgroundColor: trader._id === currentUser?._id 
                                            ? 'rgba(59, 130, 246, 0.3)' 
                                            : 'rgba(55, 65, 81, 0.3)'
                                    }}
                                >
                                    <td className="px-4 py-4 text-white">
                                        <motion.div
                                            className="flex items-center gap-2"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {index < 3 && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.5 + index * 0.1 }}
                                                >
                                                    {index === 0 && <TrophySVG className="w-6 h-6" color="#FCD34D" />}
                                                    {index === 1 && <TrophySVG className="w-6 h-6" color="#9CA3AF" />}
                                                    {index === 2 && <TrophySVG className="w-6 h-6" color="#92400E" />}
                                                </motion.div>
                                            )}
                                            #{index + 1}
                                        </motion.div>
                                    </td>
                                    <td className="px-4 py-4 text-white">
                                        {trader.username}
                                        {trader._id === currentUser?._id && 
                                            <span className="ml-2 text-blue-400">(You)</span>
                                        }
                                    </td>
                                    <td className="px-4 py-4 text-right text-white">
                                        ${(trader.portfolioValue || 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4 text-right text-white">
                                        ${(trader.cashBalance || 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4 text-right text-white">
                                        ${(trader.totalValue || 0).toFixed(2)}
                                    </td>
                                    <td className={`px-4 py-4 text-right ${
                                        (trader.profitLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                        ${Math.abs(trader.profitLoss || 0).toFixed(2)}
                                        ({(trader.profitLossPercentage || 0).toFixed(2)}%)
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Leaderboard; 