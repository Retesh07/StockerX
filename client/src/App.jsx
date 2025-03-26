import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Portfolio from './pages/Portfolio';
import Trade from './pages/Trade';
import Leaderboard from './pages/Leaderboard';
import TransactionHistory from './pages/TransactionHistory';
import PrivateRoute from './components/PrivateRoute';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import BrokerageCalculator from './components/BrokerageCalculator';

function AnimatedRoutes({ setIsCalculatorOpen }) {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                    <PrivateRoute>
                        <Dashboard setIsCalculatorOpen={setIsCalculatorOpen} />
                    </PrivateRoute>
                } />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard setIsCalculatorOpen={setIsCalculatorOpen} />
                    </PrivateRoute>
                } />
                <Route path="/portfolio" element={
                    <PrivateRoute>
                        <Portfolio setIsCalculatorOpen={setIsCalculatorOpen} />
                    </PrivateRoute>
                } />
                <Route path="/transactions" element={
                    <PrivateRoute>
                        <TransactionHistory setIsCalculatorOpen={setIsCalculatorOpen} />
                    </PrivateRoute>
                } />
                <Route path="/trade/:stockId" element={
                    <PrivateRoute>
                        <Trade />
                    </PrivateRoute>
                } />
                <Route path="/leaderboard" element={
                    <PrivateRoute>
                        <Leaderboard />
                    </PrivateRoute>
                } />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="min-h-screen bg-gray-900">
                    <Navbar onCalculatorClick={() => {
                        console.log("Navbar calculator click");
                        setIsCalculatorOpen(true);
                    }} />
                    
                    <AnimatedRoutes setIsCalculatorOpen={setIsCalculatorOpen} />
                    
                    <AnimatePresence>
                        {isCalculatorOpen && (
                            <>
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                                    onClick={() => {
                                        console.log("Backdrop click");
                                        setIsCalculatorOpen(false);
                                    }}
                                />
                                
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="fixed top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                                >
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                console.log("Close button click");
                                                setIsCalculatorOpen(false);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center z-10 hover:bg-red-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                        <BrokerageCalculator />
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;