const mongoose = require('mongoose');
const importStocksFromCSV = require('../utils/importStocks');
require('dotenv').config();

const importStocks = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Importing stocks from CSV...');
        await importStocksFromCSV('./data/stocks.csv');
        console.log('Stock import completed');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

importStocks(); 