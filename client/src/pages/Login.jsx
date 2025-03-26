import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await login(formData);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
            console.error('Login error:', err);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        },
        exit: { 
            opacity: 0,
            transition: { ease: 'easeOut' }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <motion.div 
            className="flex items-center justify-center min-h-screen bg-gray-900 relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Additional SVG Background Elements */}
            <div className="absolute inset-0 w-full h-full">
                {/* Bull and Bear Icons */}
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={`animal-${i}`}
                        className="absolute"
                        style={{
                            top: `${Math.random() * 80 + 10}%`,
                            left: `${Math.random() * 80 + 10}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.4, 0.2],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 2,
                            delay: i * 0.7,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        <svg
                            className={`w-12 h-12 ${i % 2 === 0 ? 'text-green-500' : 'text-red-500'} opacity-20`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            {i % 2 === 0 ? (
                                // Bull Icon
                                <path d="M20 4L18 6H14L12 4L10 6H6L4 4V8L2 10L4 12V16L6 18L8 16H12L14 18L16 16H20L22 18L20 16V12L22 10L20 8V4Z"/>
                            ) : (
                                // Bear Icon
                                <path d="M19 3L17 5H13L11 3L9 5H5L3 3V7L1 9L3 11V15L5 17L7 15H11L13 17L15 15H19L21 17L19 15V11L21 9L19 7V3Z"/>
                            )}
                        </svg>
                    </motion.div>
                ))}

                {/* Animated Candlesticks */}
                <div className="absolute inset-0 flex justify-around items-center opacity-15">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={`candle-${i}`}
                            className="relative"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <motion.div
                                className={`w-1 ${i % 2 === 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                initial={{ height: 20 }}
                                animate={{ 
                                    height: [20, 60, 20],
                                }}
                                transition={{
                                    duration: 2,
                                    delay: i * 0.2,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            />
                            <motion.div
                                className={`absolute w-0.5 ${i % 2 === 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                }}
                                initial={{ height: 40 }}
                                animate={{ 
                                    height: [40, 80, 40],
                                }}
                                transition={{
                                    duration: 2,
                                    delay: i * 0.2,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Trading Symbols */}
                {['BTC', 'ETH', 'USD', 'EUR', 'GBP', 'JPY'].map((symbol, i) => (
                    <motion.div
                        key={`symbol-${i}`}
                        className="absolute text-sm font-bold"
                        style={{
                            top: `${Math.random() * 90 + 5}%`,
                            left: `${Math.random() * 90 + 5}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.5, 0.2],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            delay: i * 0.5,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        <span className={`${i % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {symbol}
                        </span>
                    </motion.div>
                ))}

                {/* Trend Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10">
                    <motion.path
                        d="M0,50 Q25,30 50,50 T100,30"
                        stroke="#22c55e"
                        strokeWidth="1"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.path
                        d="M0,70 Q25,90 50,70 T100,90"
                        stroke="#ef4444"
                        strokeWidth="1"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1, repeat: Infinity }}
                    />
                </svg>
            </div>

            {/* Updated Gradient Orbs */}
            <motion.div 
                className="absolute w-96 h-96 bg-green-500 rounded-full filter blur-3xl opacity-20"
                animate={{ 
                    scale: [1, 1.2, 1],
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                }}
                transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ top: '10%', left: '20%' }}
            />
            <motion.div 
                className="absolute w-96 h-96 bg-red-500 rounded-full filter blur-3xl opacity-20"
                animate={{ 
                    scale: [1.2, 1, 1.2],
                    x: [0, -100, 0],
                    y: [0, 50, 0],
                }}
                transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ bottom: '10%', right: '20%' }}
            />

            {/* Login Form with Updated Colors */}
            <motion.div 
                className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-lg shadow-lg w-96 relative z-10 border border-gray-700"
                variants={itemVariants}
            >
                <motion.h2 
                    className="text-3xl font-bold text-white mb-6 text-center"
                    variants={itemVariants}
                >
                    Welcome 
                </motion.h2>
                
                {error && (
                    <motion.div 
                        className="bg-red-500/80 backdrop-blur-sm text-white p-3 rounded mb-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <motion.div className="mb-4" variants={itemVariants}>
                        <motion.input
                            type="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-gray-700/50 backdrop-blur-sm text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            whileFocus={{ scale: 1.02 }}
                        />
                    </motion.div>

                    <motion.div className="mb-6" variants={itemVariants}>
                        <motion.input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-gray-700/50 backdrop-blur-sm text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            whileFocus={{ scale: 1.02 }}
                        />
                    </motion.div>

                    <motion.button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Sign in
                    </motion.button>
                </form>

                <motion.div 
                    className="mt-4 text-center text-gray-400"
                    variants={itemVariants}
                >
                    Don't have an account?{' '}
                    <Link to="/register" className="text-red-500 hover:text-red-400">
                        Register here
                    </Link>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Login;