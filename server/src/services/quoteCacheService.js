/**
 * QuoteCacheService
 * - Batch fetches quotes from yahoo-finance2 (when available)
 * - In-memory cache with 15-second TTL
 * - Stale fallback cache preserving last known quotes if upstream fails
 * - Returns live-refreshing quote dictionary
 */

const Stock = require('../models/Stock');

// In-memory cache store
const quoteCache = new Map();
let lastBatchFetchTime = 0;
const CACHE_TTL_MS = 15 * 1000; // 15 seconds

// Try loading yahoo-finance2 gracefully
let yahooFinance = null;
try {
    const yf = require('yahoo-finance2');
    yahooFinance = yf.default || yf;
} catch (err) {
    console.log('yahoo-finance2 not found in node_modules, using database quotes with stale fallback');
}

function toYahooSymbol(symbol) {
    if (symbol.includes('.')) return symbol;
    return `${symbol}.NS`;
}

/**
 * Fetch a single quote with 15s cache + stale fallback
 */
async function getQuote(symbol) {
    const cleanSym = symbol.replace('.NS', '').replace('.BO', '').toUpperCase();
    const now = Date.now();
    const cached = quoteCache.get(cleanSym);

    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
        return { ...cached.data, isStale: false, cached: true };
    }

    try {
        if (yahooFinance) {
            const yfSymbol = toYahooSymbol(cleanSym);
            const result = await yahooFinance.quote(yfSymbol);
            if (result && result.regularMarketPrice) {
                const quoteData = {
                    symbol: cleanSym,
                    price: result.regularMarketPrice,
                    change: result.regularMarketChange || 0,
                    changePercent: result.regularMarketChangePercent || 0,
                    high: result.regularMarketDayHigh || result.regularMarketPrice,
                    low: result.regularMarketDayLow || result.regularMarketPrice,
                    volume: result.regularMarketVolume || 0,
                    previousClose: result.regularMarketPreviousClose || result.regularMarketPrice,
                    lastUpdated: new Date().toISOString(),
                    isStale: false
                };
                quoteCache.set(cleanSym, { timestamp: now, data: quoteData });
                return quoteData;
            }
        }
    } catch (err) {
        console.warn(`Upstream quote fetch failed for ${cleanSym}: ${err.message}. Using stale fallback.`);
    }

    // Fallback 1: Return previously cached stale quote
    if (cached) {
        return { ...cached.data, isStale: true };
    }

    // Fallback 2: Read baseline from database
    const stock = await Stock.findOne({ symbol });
    if (stock) {
        const change = stock.currentPrice - stock.previousClose;
        const changePercent = stock.previousClose ? (change / stock.previousClose) * 100 : 0;
        const quoteData = {
            symbol: stock.symbol,
            price: stock.currentPrice,
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            high: stock.dayHigh,
            low: stock.dayLow,
            volume: stock.volume,
            previousClose: stock.previousClose,
            lastUpdated: new Date().toISOString(),
            isStale: true
        };
        quoteCache.set(symbol, { timestamp: now, data: quoteData });
        return quoteData;
    }

    return null;
}

/**
 * Batch fetch quotes for multiple symbols with 15s cache
 */
async function getBatchQuotes(symbols) {
    const now = Date.now();
    const results = {};
    const missingOrExpired = [];

    // Check what is already valid in 15s cache
    for (const sym of symbols) {
        const cached = quoteCache.get(sym);
        if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
            results[sym] = { ...cached.data, isStale: false };
        } else {
            missingOrExpired.push(sym);
        }
    }

    // If all are fresh in cache, return immediately
    if (missingOrExpired.length === 0) {
        return results;
    }

    // Batch fetch missing/expired symbols from yahoo-finance2
    if (yahooFinance && missingOrExpired.length > 0) {
        try {
            // yahoo-finance2 supports array batch quote
            const yfSymbols = missingOrExpired.map(toYahooSymbol);
            const yfQuotes = await yahooFinance.quote(yfSymbols);
            const quoteArray = Array.isArray(yfQuotes) ? yfQuotes : [yfQuotes];

            for (const q of quoteArray) {
                if (q && q.symbol && q.regularMarketPrice) {
                    const cleanSym = q.symbol.replace('.NS', '').replace('.BO', '');
                    const quoteData = {
                        symbol: cleanSym,
                        price: q.regularMarketPrice,
                        change: Number((q.regularMarketChange || 0).toFixed(2)),
                        changePercent: Number((q.regularMarketChangePercent || 0).toFixed(2)),
                        high: q.regularMarketDayHigh || q.regularMarketPrice,
                        low: q.regularMarketDayLow || q.regularMarketPrice,
                        volume: q.regularMarketVolume || 0,
                        previousClose: q.regularMarketPreviousClose || q.regularMarketPrice,
                        lastUpdated: new Date().toISOString(),
                        isStale: false
                    };
                    quoteCache.set(cleanSym, { timestamp: now, data: quoteData });
                    results[cleanSym] = quoteData;

                    // Also keep MongoDB in sync with latest price asynchronously
                    Stock.updateOne({ symbol: cleanSym }, { currentPrice: q.regularMarketPrice }).exec().catch(() => {});
                }
            }
        } catch (err) {
            console.warn(`Batch upstream quote fetch failed: ${err.message}. Using stale fallback.`);
        }
    }

    // For any symbol that failed or wasn't fetched, fallback to stale cache or DB
    for (const sym of missingOrExpired) {
        if (!results[sym]) {
            const cached = quoteCache.get(sym);
            if (cached) {
                results[sym] = { ...cached.data, isStale: true };
            } else {
                const stock = await Stock.findOne({ symbol: sym });
                if (stock) {
                    const change = stock.currentPrice - stock.previousClose;
                    const changePercent = stock.previousClose ? (change / stock.previousClose) * 100 : 0;
                    const quoteData = {
                        symbol: stock.symbol,
                        price: stock.currentPrice,
                        change: Number(change.toFixed(2)),
                        changePercent: Number(changePercent.toFixed(2)),
                        high: stock.dayHigh,
                        low: stock.dayLow,
                        volume: stock.volume,
                        previousClose: stock.previousClose,
                        lastUpdated: new Date().toISOString(),
                        isStale: true
                    };
                    quoteCache.set(sym, { timestamp: now, data: quoteData });
                    results[sym] = quoteData;
                }
            }
        }
    }

    return results;
}

/**
 * Generate historical price points for 1D, 1W, 1M timeframes
 */
async function getHistoricalData(symbol, timeframe = '1D') {
    const quote = await getQuote(symbol);
    const basePrice = quote ? quote.price : 100;
    const now = Date.now();
    const points = [];

    let count = 24;
    let stepMs = 60 * 60 * 1000; // 1 hour per step for 1D
    let volatility = 0.008;

    if (timeframe === '1W') {
        count = 28;
        stepMs = 6 * 60 * 60 * 1000; // 6 hours per step
        volatility = 0.02;
    } else if (timeframe === '1M') {
        count = 30;
        stepMs = 24 * 60 * 60 * 1000; // 1 day per step
        volatility = 0.05;
    }

    // Seeded pseudo-random walk anchored to current basePrice
    let price = basePrice * (1 - (volatility * 0.8));
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now - (i * stepMs)).toISOString();
        if (i === 0) {
            price = basePrice;
        } else {
            const delta = (Math.sin(i * 1.5) * 0.5 + (Math.random() - 0.48)) * (basePrice * volatility * 0.25);
            price = Math.max(1, price + delta);
        }
        points.push({
            time,
            price: Number(price.toFixed(2))
        });
    }

    const startPrice = points[0].price;
    const endPrice = points[points.length - 1].price;
    const periodChange = endPrice - startPrice;
    const periodChangePercent = (periodChange / startPrice) * 100;

    return {
        symbol,
        timeframe,
        currentPrice: basePrice,
        startPrice,
        periodChange: Number(periodChange.toFixed(2)),
        periodChangePercent: Number(periodChangePercent.toFixed(2)),
        points
    };
}

module.exports = {
    getQuote,
    getBatchQuotes,
    getHistoricalData,
    CACHE_TTL_MS
};
