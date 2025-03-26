import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BrokerageCalculator = () => {
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [brokerage, setBrokerage] = useState('');
  const [profitLoss, setProfitLoss] = useState(null);

  const calculateBrokerage = () => {
    const buyAmount = parseFloat(buyPrice) * parseInt(quantity);
    const sellAmount = parseFloat(sellPrice) * parseInt(quantity);
    const totalBrokerage = (buyAmount + sellAmount) * 0.001; // 0.1% brokerage fee
    const pl = sellAmount - buyAmount - totalBrokerage;
    
    setBrokerage(totalBrokerage.toFixed(2));
    setProfitLoss(pl.toFixed(2));
  };

  const resetCalculator = () => {
    setBuyPrice('');
    setSellPrice('');
    setQuantity('');
    setBrokerage('');
    setProfitLoss(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700"
    >
      <motion.h3 
        className="text-xl font-semibold text-white mb-4 text-center"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        Brokerage Calculator
      </motion.h3>
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          calculateBrokerage();
        }}
        className="space-y-4"
      >
        <motion.div 
          className="mb-4"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Buy Price
          </label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter buy price"
            required
          />
        </motion.div>

        <motion.div 
          className="mb-4"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Sell Price
          </label>
          <input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter sell price"
            required
          />
        </motion.div>

        <motion.div 
          className="mb-4"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter quantity"
            required
          />
        </motion.div>

        <motion.div 
          className="flex gap-4"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Calculate
          </motion.button>

          <motion.button
            type="button"
            onClick={resetCalculator}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reset
          </motion.button>
        </motion.div>
      </form>

      <AnimatePresence>
        {(brokerage || profitLoss) && (
          <motion.div 
            className="mt-6 space-y-2 border-t border-gray-700 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-sm text-gray-300">
              Total Brokerage: <span className="font-bold text-white">₹{brokerage}</span>
            </p>
            <p className="text-sm text-gray-300">
              Profit/Loss: <span className={`font-bold ${parseFloat(profitLoss) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ₹{profitLoss}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BrokerageCalculator; 