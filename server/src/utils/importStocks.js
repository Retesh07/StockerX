const csv = require('csv-parser');
const fs = require('fs');
const Stock = require('../models/Stock');

const importStocksFromCSV = async (filePath) => {
    try {
        console.log('Starting stock import...');
        const stocks = [];
        
        // Read CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    stocks.push({
                        symbol: data.symbol,
                        name: data.name,
                        currentPrice: parseFloat(data.currentPrice),
                        previousClose: parseFloat(data.previousClose),
                        openPrice: parseFloat(data.openPrice),
                        dayLow: parseFloat(data.dayLow),
                        dayHigh: parseFloat(data.dayHigh),
                        volume: parseInt(data.volume)
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`Found ${stocks.length} stocks in CSV`);

        // Clear existing stocks
        await Stock.deleteMany({});
        console.log('Cleared existing stocks');

        // Insert new stocks
        const result = await Stock.insertMany(stocks);
        console.log(`Successfully imported ${result.length} stocks`);
        
        return result;
    } catch (error) {
        console.error('Error importing stocks:', error);
        throw error;
    }
};

module.exports = importStocksFromCSV; 