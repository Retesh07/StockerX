import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * StockCard component wrapped in React.memo
 * Only re-renders when this specific stock's price, details, or tick state changes.
 */
const StockCard = React.memo(({ stock, previousPrice, onOpenChart }) => {
    const navigate = useNavigate();
    const [tickDirection, setTickDirection] = useState(null); // 'up' | 'down' | null
    const prevPriceRef = useRef(stock.currentPrice);

    // Visual Price Feedback: Flash green/red on price updates
    useEffect(() => {
        if (prevPriceRef.current !== undefined && prevPriceRef.current !== stock.currentPrice) {
            if (stock.currentPrice > prevPriceRef.current) {
                setTickDirection('up');
            } else if (stock.currentPrice < prevPriceRef.current) {
                setTickDirection('down');
            }

            const timer = setTimeout(() => {
                setTickDirection(null);
            }, 1200);

            prevPriceRef.current = stock.currentPrice;
            return () => clearTimeout(timer);
        }
    }, [stock.currentPrice]);

    const change = stock.change !== undefined
        ? stock.change
        : (stock.currentPrice - (stock.previousClose || stock.currentPrice));
    const changePercent = stock.changePercent !== undefined
        ? stock.changePercent
        : (stock.previousClose ? (change / stock.previousClose) * 100 : 0);
    const isGain = change >= 0;

    // Day range percentage for progress indicator
    const dayRange = (stock.dayHigh - stock.dayLow) || 1;
    const progress = Math.min(100, Math.max(0, ((stock.currentPrice - stock.dayLow) / dayRange) * 100));

    // Dynamic flash classes
    const flashClass = tickDirection === 'up'
        ? 'ring-2 ring-green-500 bg-green-950/20 border-green-500/60'
        : tickDirection === 'down'
        ? 'ring-2 ring-red-500 bg-red-950/20 border-red-500/60'
        : 'border-gray-800 bg-gray-800/40 hover:border-gray-700';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`relative rounded-xl p-5 border backdrop-blur-sm transition-all duration-300 shadow-lg flex flex-col justify-between ${flashClass}`}
        >
            {/* Top row: Symbol, Name & Live indicator */}
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-white tracking-wide">{stock.symbol}</h3>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live-refreshing" />
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{stock.name}</p>
                    </div>

                    {/* Price and Delta badge */}
                    <div className="text-right">
                        <div className={`text-xl font-extrabold transition-colors duration-200 ${
                            tickDirection === 'up' ? 'text-green-400' : tickDirection === 'down' ? 'text-red-400' : 'text-white'
                        }`}>
                            ₹{stock.currentPrice.toFixed(2)}
                        </div>
                        <div className={`text-xs font-semibold flex items-center justify-end space-x-1 ${
                            isGain ? 'text-green-400' : 'text-red-400'
                        }`}>
                            <span>{isGain ? '▲ +' : '▼ '}</span>
                            <span>₹{Math.abs(change).toFixed(2)}</span>
                            <span>({Math.abs(changePercent).toFixed(2)}%)</span>
                        </div>
                    </div>
                </div>

                {/* Day Range Bar */}
                <div className="my-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-gray-400">
                        <span>L: ₹{stock.dayLow.toFixed(2)}</span>
                        <span className="text-gray-500">Day Range</span>
                        <span>H: ₹{stock.dayHigh.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isGain ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Volume */}
                <div className="flex justify-between text-xs text-gray-400 py-1 border-t border-gray-800/80">
                    <span>Volume</span>
                    <span className="text-gray-200 font-mono">
                        {(stock.volume || 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-800">
                <button
                    onClick={() => onOpenChart(stock)}
                    className="flex-1 py-1.5 px-3 bg-gray-750 hover:bg-gray-700 bg-gray-800/90 text-gray-200 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1 border border-gray-700"
                >
                    <span>📊</span>
                    <span>Chart</span>
                </button>
                <button
                    onClick={() => navigate(`/trade/${stock._id}`)}
                    className="flex-1 py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-md transition-all hover:scale-102 active:scale-98 flex items-center justify-center space-x-1"
                >
                    <span>Trade</span>
                </button>
            </div>
        </motion.div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if currentPrice, dayHigh, dayLow, or volume changed
    return (
        prevProps.stock._id === nextProps.stock._id &&
        prevProps.stock.currentPrice === nextProps.stock.currentPrice &&
        prevProps.stock.volume === nextProps.stock.volume &&
        prevProps.stock.dayHigh === nextProps.stock.dayHigh &&
        prevProps.stock.dayLow === nextProps.stock.dayLow
    );
});

export default StockCard;
