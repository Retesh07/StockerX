import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stockService } from '../services/api';
import useDebounce from '../hooks/useDebounce';
import StockCard from '../components/StockCard';
import StockChartModal from '../components/StockChartModal';
import { useNavigate } from 'react-router-dom';

// Sector mapping helper for Indian NSE stocks
const getSectorForSymbol = (symbol) => {
    const it = ['TCS', 'INFY', 'WIPRO', 'HCLTECH'];
    const banking = ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'AXISBANK', 'BAJFINANCE'];
    const auto = ['TATAMOTORS', 'MARUTI'];
    const energy = ['RELIANCE', 'NTPC'];
    if (it.includes(symbol)) return 'IT & Tech';
    if (banking.includes(symbol)) return 'Banking';
    if (auto.includes(symbol)) return 'Auto';
    if (energy.includes(symbol)) return 'Energy';
    return 'Consumer & Infra';
};

const Dashboard = ({ setIsCalculatorOpen }) => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [selectedStockForChart, setSelectedStockForChart] = useState(null);

    // Filters and Search
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [selectedSector, setSelectedSector] = useState('All');
    const [selectedPerf, setSelectedPerf] = useState('All'); // 'All' | 'Gainers' | 'Losers'
    const [sortBy, setSortBy] = useState('volume'); // 'volume' | 'price-high' | 'price-low' | 'gainers' | 'symbol'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

    const navigate = useNavigate();

    // 1. Initial Data Fetch
    const fetchStocks = useCallback(async () => {
        try {
            setError(null);
            const response = await stockService.getAllStocks();
            const rawData = response.data || [];

            // Exclude legacy foreign and placeholder test tickers so only Indian stocks are displayed
            const excludedSymbols = [
                'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'NVDA',
                'ABCD', 'EFGH', 'IJKL', 'MNOP', 'QRST', 'UVWX', 'YZAB', 'CDEF', 'GHIJ', 'KLMN'
            ];
            const data = rawData.filter(s => !excludedSymbols.includes(s.symbol?.toUpperCase()));

            setStocks(data);
            setLastUpdated(new Date());
            setLoading(false);
        } catch (err) {
            console.error('Error fetching stocks:', err);
            setError(err.response?.data?.message || 'Failed to load stock data. Check server connection.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStocks();
    }, [fetchStocks]);

    // 2. 15-Second Live-Refreshing Quote Poller with AbortController
    useEffect(() => {
        if (loading || error) return;

        const controller = new AbortController();

        const pollQuotes = async () => {
            try {
                const response = await stockService.getQuotes();
                const quotes = response.data?.quotes || {};

                setStocks((prevStocks) =>
                    prevStocks.map((stock) => {
                        const quote = quotes[stock.symbol];
                        if (quote && quote.price) {
                            return {
                                ...stock,
                                currentPrice: quote.price,
                                change: quote.change,
                                changePercent: quote.changePercent,
                                dayHigh: Math.max(stock.dayHigh, quote.high || quote.price),
                                dayLow: Math.min(stock.dayLow, quote.low || quote.price),
                                volume: quote.volume || stock.volume
                            };
                        }
                        return stock;
                    })
                );
                setLastUpdated(new Date());
            } catch (err) {
                // Background polling failures are non-blocking (stale data preserved)
                console.warn('Background quote refresh check:', err.message);
            }
        };

        const intervalId = setInterval(pollQuotes, 15000); // 15-second refresh interval

        return () => {
            clearInterval(intervalId);
            controller.abort();
        };
    }, [loading, error]);

    // 3. Filtered and Sorted Stocks (Memoized)
    const filteredStocks = useMemo(() => {
        return stocks.filter((stock) => {
            // Search filter (Symbol or Name)
            const matchesSearch =
                debouncedSearch === '' ||
                stock.symbol.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                stock.name.toLowerCase().includes(debouncedSearch.toLowerCase());

            // Sector filter
            const matchesSector =
                selectedSector === 'All' || getSectorForSymbol(stock.symbol) === selectedSector;

            // Performance filter
            const change = stock.change !== undefined
                ? stock.change
                : (stock.currentPrice - (stock.previousClose || stock.currentPrice));
            const matchesPerf =
                selectedPerf === 'All' ||
                (selectedPerf === 'Gainers' && change >= 0) ||
                (selectedPerf === 'Losers' && change < 0);

            return matchesSearch && matchesSector && matchesPerf;
        }).sort((a, b) => {
            if (sortBy === 'price-high') return b.currentPrice - a.currentPrice;
            if (sortBy === 'price-low') return a.currentPrice - b.currentPrice;
            if (sortBy === 'gainers') {
                const changeA = a.changePercent ?? (a.currentPrice - a.previousClose);
                const changeB = b.changePercent ?? (b.currentPrice - b.previousClose);
                return changeB - changeA;
            }
            if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol);
            // Default: volume
            return (b.volume || 0) - (a.volume || 0);
        });
    }, [stocks, debouncedSearch, selectedSector, selectedPerf, sortBy]);

    // Handlers
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedSector('All');
        setSelectedPerf('All');
        setSortBy('volume');
    };

    const handleOpenChart = useCallback((stock) => {
        setSelectedStockForChart(stock);
    }, []);

    const handleCloseChart = useCallback(() => {
        setSelectedStockForChart(null);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 text-gray-100">
            <div className="max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-800 gap-4">
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">Market Overview</h1>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                                <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Live-Refreshing (15s)
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                            Streaming quotes cached via Yahoo Finance • Zero client-side API exposure
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {lastUpdated && (
                            <span className="text-xs text-gray-400 hidden sm:inline-block font-mono">
                                Updated: {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                        <button
                            onClick={() => setIsCalculatorOpen(true)}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-700 transition-colors flex items-center space-x-1.5"
                        >
                            <span>🧮</span>
                            <span>Calculator</span>
                        </button>
                    </div>
                </div>

                {/* Toolbar: Search, Filters, Sort & View Mode */}
                <div className="bg-gray-850/80 bg-gray-800/40 border border-gray-800 rounded-xl p-4 mb-6 shadow-sm backdrop-blur-sm space-y-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                        {/* Search Input (Debounced by 300ms) */}
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search symbol or company (300ms debounced)..."
                                className="w-full pl-9 pr-8 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Sort & View Mode Controls */}
                        <div className="flex items-center space-x-2">
                            <label className="text-xs text-gray-400 font-medium">Sort:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-900 text-gray-200 text-xs border border-gray-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                            >
                                <option value="volume">Highest Volume</option>
                                <option value="gainers">Top % Gainers</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="symbol">Symbol (A-Z)</option>
                            </select>

                            {/* View Mode Toggle */}
                            <div className="flex bg-gray-900 border border-gray-700 rounded-lg p-0.5">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                                        viewMode === 'grid' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                                    title="Grid View"
                                >
                                    ⊞
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                                        viewMode === 'table' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                                    title="Density Table View"
                                >
                                    ☰
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Pills: Sectors & Performance */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800/80">
                        {/* Sector pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-gray-400 mr-1">Sector:</span>
                            {['All', 'IT & Tech', 'Banking', 'Auto', 'Energy', 'Consumer & Infra'].map((sec) => (
                                <button
                                    key={sec}
                                    onClick={() => setSelectedSector(sec)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        selectedSector === sec
                                            ? 'bg-green-600/30 text-green-300 border border-green-500/50'
                                            : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-gray-800'
                                    }`}
                                >
                                    {sec}
                                </button>
                            ))}
                        </div>

                        {/* Performance pills */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400 mr-1">Trend:</span>
                            {['All', 'Gainers', 'Losers'].map((perf) => (
                                <button
                                    key={perf}
                                    onClick={() => setSelectedPerf(perf)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        selectedPerf === perf
                                            ? perf === 'Gainers'
                                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50'
                                                : perf === 'Losers'
                                                ? 'bg-rose-900/60 text-rose-300 border border-rose-500/50'
                                                : 'bg-green-600/30 text-green-300 border border-green-500/50'
                                            : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-gray-800'
                                    }`}
                                >
                                    {perf}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 1. Loading Skeleton State */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={`skeleton-${i}`}
                                className="bg-gray-800/40 border border-gray-800 rounded-xl p-5 animate-pulse space-y-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="h-6 w-20 bg-gray-700/60 rounded" />
                                        <div className="h-3 w-32 bg-gray-700/40 rounded" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-6 w-16 bg-gray-700/60 rounded" />
                                        <div className="h-3 w-12 bg-gray-700/40 rounded" />
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-gray-700/40 rounded" />
                                <div className="h-8 w-full bg-gray-700/50 rounded-lg" />
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. Error State with Retry Button */}
                {error && !loading && (
                    <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-8 text-center max-w-lg mx-auto my-12">
                        <div className="text-3xl mb-2">⚠️</div>
                        <h3 className="text-lg font-bold text-white mb-1">Failed to Connect</h3>
                        <p className="text-sm text-red-300 mb-5">{error}</p>
                        <button
                            onClick={fetchStocks}
                            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm shadow transition-all hover:scale-105 active:scale-95"
                        >
                            Retry Connection
                        </button>
                    </div>
                )}

                {/* 3. Empty State */}
                {!loading && !error && filteredStocks.length === 0 && (
                    <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-10 text-center max-w-md mx-auto my-12">
                        <div className="text-3xl mb-2">🔍</div>
                        <h3 className="text-lg font-bold text-white mb-1">No Stocks Found</h3>
                        <p className="text-sm text-gray-400 mb-5">
                            No market securities matched your current filter criteria.
                        </p>
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg text-xs transition-colors"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}

                {/* 4. Grid View (Rendered via React.memo StockCard) */}
                {!loading && !error && filteredStocks.length > 0 && viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredStocks.map((stock) => (
                            <StockCard
                                key={stock._id}
                                stock={stock}
                                onOpenChart={handleOpenChart}
                            />
                        ))}
                    </div>
                )}

                {/* 5. Density Table View (Responsive Table) */}
                {!loading && !error && filteredStocks.length > 0 && viewMode === 'table' && (
                    <div className="bg-gray-800/40 border border-gray-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="bg-gray-900/80 text-xs uppercase text-gray-400 border-b border-gray-800">
                                    <tr>
                                        <th className="px-5 py-3">Symbol</th>
                                        <th className="px-5 py-3">Company</th>
                                        <th className="px-5 py-3 text-right">Price</th>
                                        <th className="px-5 py-3 text-right">24h Change</th>
                                        <th className="px-5 py-3 text-right">Day Range</th>
                                        <th className="px-5 py-3 text-right">Volume</th>
                                        <th className="px-5 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/60">
                                    {filteredStocks.map((stock) => {
                                        const change = stock.change !== undefined
                                            ? stock.change
                                            : (stock.currentPrice - (stock.previousClose || stock.currentPrice));
                                        const changePercent = stock.changePercent !== undefined
                                            ? stock.changePercent
                                            : (stock.previousClose ? (change / stock.previousClose) * 100 : 0);
                                        const isGain = change >= 0;

                                        return (
                                            <tr key={stock._id} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-5 py-3.5 font-bold text-white flex items-center space-x-2">
                                                    <span>{stock.symbol}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-400 truncate max-w-[200px]">
                                                    {stock.name}
                                                </td>
                                                <td className="px-5 py-3.5 text-right font-mono font-bold text-white">
                                                    ₹{stock.currentPrice.toFixed(2)}
                                                </td>
                                                <td className={`px-5 py-3.5 text-right font-semibold ${isGain ? 'text-green-400' : 'text-red-400'}`}>
                                                    {isGain ? '▲ +' : '▼ '}
                                                    ₹{Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-xs text-gray-400 font-mono">
                                                    ₹{stock.dayLow.toFixed(2)} - ₹{stock.dayHigh.toFixed(2)}
                                                </td>
                                                <td className="px-5 py-3.5 text-right font-mono text-gray-300">
                                                    {(stock.volume || 0).toLocaleString()}
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleOpenChart(stock)}
                                                            className="p-1 px-2 text-xs bg-gray-700/80 hover:bg-gray-700 text-gray-200 rounded"
                                                        >
                                                            Chart
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/trade/${stock._id}`)}
                                                            className="p-1 px-3 text-xs bg-green-600 hover:bg-green-700 text-white font-medium rounded shadow"
                                                        >
                                                            Trade
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Interactive Stock Chart Modal (Item 5) */}
            <StockChartModal
                stock={selectedStockForChart}
                isOpen={Boolean(selectedStockForChart)}
                onClose={handleCloseChart}
            />
        </div>
    );
};

export default Dashboard;