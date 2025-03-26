import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Transaction SVG Component
const TransactionSVG = ({ className, color }) => (
    <motion.svg
        className={className}
        viewBox="0 0 24 24"
        fill={color}
        initial={{ scale: 1 }}
        animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
    >
        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>
    </motion.svg>
);

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/transactions', {
                    withCredentials: true
                });
                setTransactions(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) {
        return (
            <motion.div 
                className="flex justify-center items-center min-h-screen bg-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                    className="text-white text-xl"
                >
                    Loading transactions...
                </motion.div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div 
                className="flex justify-center items-center min-h-screen bg-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="text-red-500 text-xl">Error: {error}</div>
            </motion.div>
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
                {[...Array(6)].map((_, i) => (
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
                        }}
                        transition={{
                            duration: 4 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                        }}
                    >
                        <TransactionSVG 
                            className="w-8 h-8" 
                            color={i % 2 === 0 ? '#4ADE80' : '#F87171'}
                        />
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
                    Transaction History
                </motion.h1>

                <motion.div 
                    className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-700/50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/30">
                                <AnimatePresence>
                                    {transactions.map((transaction, index) => (
                                        <motion.tr 
                                            key={transaction._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ 
                                                backgroundColor: 'rgba(55, 65, 81, 0.3)',
                                                scale: 1.01,
                                                transition: { duration: 0.2 }
                                            }}
                                            className="bg-gray-800/50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                {transaction.stock.symbol}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <motion.span 
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {transaction.type.toUpperCase()}
                                                </motion.span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {transaction.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                ${transaction.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                ${(transaction.price * transaction.quantity).toFixed(2)}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default TransactionHistory; 