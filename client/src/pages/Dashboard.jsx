import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { stockService } from '../services/api';

const Dashboard = ({ setIsCalculatorOpen }) => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    // Background decoration variants
    const decorationVariants = {
        animate: {
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1],
            transition: {
                duration: 15,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    // Add new state for interactive elements
    const [hoveredStock, setHoveredStock] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);
    const [addedToWatchlist, setAddedToWatchlist] = useState(null);

    // SVG Components
    const TrendingSVG = ({ className }) => (
        <motion.svg 
            className={className} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </motion.svg>
    );

    const MarketSVG = ({ className }) => (
        <motion.svg 
            className={className} 
            viewBox="0 0 24 24" 
            fill="currentColor"
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
        >
            <path d="M4 4h16v16H4V4zm2 4h12v10H6V8zm2 3h8v4H8v-4z" />
        </motion.svg>
    );

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const response = await stockService.getAllStocks();
                setStocks(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching stocks:', err);
                setError('Error loading stocks');
                setLoading(false);
            }
        };

        fetchStocks();
    }, []);

    const handleCalculatorOpen = () => {
        console.log("Calculator button clicked");
        setIsCalculatorOpen(true);
    };

    const handleAddToWatchlist = async (stock) => {
        try {
            console.log('Adding stock to watchlist:', stock._id);
            await watchlistService.addToWatchlist(stock._id);
            
            // Show success message
            alert('Stock added to watchlist successfully');
            
            // Optional: Update UI to show the stock was added
            setAddedToWatchlist(stock._id);
            setTimeout(() => setAddedToWatchlist(null), 2000);
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            alert('Error adding stock to watchlist. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <motion.div
                    className="text-white text-xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <img 
                        src="/StockerX-removebg-preview.png" 
                        alt="Loading" 
                        className="w-24 h-24"
                    />
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            className="min-h-screen bg-gray-900 py-8 px-4 relative overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Interactive Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={`float-${i}`}
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
                            duration: 5 + Math.random() * 3,
                            repeat: Infinity,
                            delay: i * 0.3,
                        }}
                    >
                        {i % 2 === 0 ? (
                            <TrendingSVG className={`w-8 h-8 ${i % 4 === 0 ? 'text-green-500' : 'text-red-500'}`} />
                        ) : (
                            <MarketSVG className={`w-6 h-6 ${i % 4 === 0 ? 'text-green-500' : 'text-red-500'}`} />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="container mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8 relative w-full">
                    <div className="w-1/3" /> {/* Spacer */}
                    <motion.h1 
                        className="text-4xl font-bold text-white text-center w-1/3"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        Market Overview
                    </motion.h1>
                    <div className="w-1/3 flex justify-end"> {/* Calculator button container */}
                        <motion.button
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCalculatorOpen}
                        >
                            Open Calculator
                        </motion.button>
                    </div>
                </div>

                {/* Centered Grid Layout */}
                <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
                    variants={containerVariants}
                >
                    {stocks.map((stock) => (
                        <motion.div
                            key={stock._id}
                            className="relative bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50"
                            variants={cardVariants}
                            whileHover={{ 
                                scale: 1.02,
                                transition: { type: "spring", stiffness: 400 }
                            }}
                            onHoverStart={() => setHoveredStock(stock._id)}
                            onHoverEnd={() => setHoveredStock(null)}
                        >
                            {/* Quick View Overlay */}
                            <AnimatePresence>
                                {hoveredStock === stock._id && (
                                    <motion.div
                                        className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg p-6 flex flex-col justify-center items-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <motion.div 
                                            className="text-center space-y-4"
                                            initial={{ y: 20 }}
                                            animate={{ y: 0 }}
                                        >
                                            <p className="text-2xl font-bold text-white mb-2">{stock.symbol}</p>
                                            <p className="text-gray-400 mb-4">{stock.name}</p>
                                            <div className="flex flex-col gap-3">
                                                <motion.button
                                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => navigate(`/trade/${stock._id}`)}
                                                >
                                                    Trade Now
                                                </motion.button>
                                                
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Success Animation */}
                            <AnimatePresence>
                                {addedToWatchlist === stock._id && !hoveredStock && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap"
                                    >
                                        Added to Watchlist!
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Stock Card Content */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-2">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-green-500"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [1, 0.5, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity
                                        }}
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{stock.symbol}</h2>
                                        <p className="text-gray-400">{stock.name}</p>
                                    </div>
                                </div>
                                <motion.span 
                                    className="text-lg font-bold text-green-500"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        transition: { duration: 1, repeat: Infinity }
                                    }}
                                >
                                    ${stock.currentPrice.toFixed(2)}
                                </motion.span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-400">
                                    <span>Volume</span>
                                    <span>{stock.volume.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Day Range</span>
                                    <span>
                                        ${stock.dayLow.toFixed(2)} - ${stock.dayHigh.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Trade
                            </motion.button>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard; 