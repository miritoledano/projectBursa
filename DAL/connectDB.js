const SQLServerAdapter = require('../Adapters/SQLServerAdapter');
const dotenv = require('dotenv');

dotenv.config();
const connectionString = process.env.CONNECTION_STRING;

let adapter; 

const connectToDB = async () => {
    adapter = new SQLServerAdapter(connectionString);
    try {
        await adapter.connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        throw error; // Re-throw the error for handling elsewhere if needed
    }
};

const getDBAdapter = () => {
    if (!adapter) {
        throw new Error('Adapter is not connected to the database yet');
    }
    return adapter;
};

module.exports = { connectToDB, getDBAdapter };