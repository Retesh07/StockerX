import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuVariants = {
        open: {
            opacity: 1,
            height: "auto",
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        },
        closed: {
            opacity: 0,
            height: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    return (
        <motion.nav 
            className="bg-gray-900/90 backdrop-blur-sm sticky top-0 z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
        >
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <motion.div
                            initial={{ rotate: -180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <motion.img
                                src="/StockerX-removebg-preview.png"
                                alt="StockerX Logo"
                                className="h-12 w-auto"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            />
                        </motion.div>
                    </Link>

                    {/* Hamburger Menu Button */}
                    {user && (
                        <motion.button
                            className="lg:hidden text-white p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                className="w-6 h-5 flex flex-col justify-between"
                                animate={isMenuOpen ? "open" : "closed"}
                            >
                                <motion.span
                                    className="w-full h-0.5 bg-white block"
                                    animate={isMenuOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
                                />
                                <motion.span
                                    className="w-full h-0.5 bg-white block"
                                    animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                />
                                <motion.span
                                    className="w-full h-0.5 bg-white block"
                                    animate={isMenuOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
                                />
                            </motion.div>
                        </motion.button>
                    )}

                    {/* Desktop Menu */}
                    {user && (
                        <div className="hidden lg:flex flex-1 justify-between items-center">
                            {/* Centered Navigation Links */}
                            <div className="flex-1" /> {/* Left spacer */}
                            <motion.div 
                                className="flex items-center space-x-6"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <NavLink to="/dashboard">Dashboard</NavLink>
                                <NavLink to="/portfolio">Portfolio</NavLink>
                                <NavLink to="/transactions">Transactions</NavLink>
                                <NavLink to="/leaderboard">Leaderboard</NavLink>
                                <motion.span 
                                    className="text-white px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur-sm"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Balance: ${user.virtualBalance.toFixed(2)}
                                </motion.span>
                            </motion.div>
                            <div className="flex-1 flex justify-end"> {/* Right spacer with logout */}
                                <motion.button
                                    onClick={logout}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors ml-6"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Logout
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && user && (
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={menuVariants}
                            className="lg:hidden overflow-hidden"
                        >
                            <div className="py-4 space-y-4 flex flex-col items-center">
                                <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>
                                    Dashboard
                                </MobileNavLink>
                                <MobileNavLink to="/portfolio" onClick={() => setIsMenuOpen(false)}>
                                    Portfolio
                                </MobileNavLink>
                                <MobileNavLink to="/transactions" onClick={() => setIsMenuOpen(false)}>
                                    Transactions
                                </MobileNavLink>
                                <MobileNavLink to="/leaderboard" onClick={() => setIsMenuOpen(false)}>
                                    Leaderboard
                                </MobileNavLink>
                                <motion.span 
                                    className="text-white px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur-sm w-full text-center"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Balance: ${user.virtualBalance.toFixed(2)}
                                </motion.span>
                                <motion.button
                                    onClick={logout}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Logout
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
};

// Desktop NavLink component
const NavLink = ({ to, children }) => (
    <Link to={to}>
        <motion.span
            className="text-white hover:text-green-400 relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
            <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
            />
        </motion.span>
    </Link>
);

// Mobile NavLink component
const MobileNavLink = ({ to, children, onClick }) => (
    <Link to={to} className="w-full" onClick={onClick}>
        <motion.span
            className="text-white hover:text-green-400 block text-center py-2 w-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.span>
    </Link>
);

export default Navbar; 