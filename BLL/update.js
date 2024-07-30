const fs = require('fs');
const { getYesterdayDate, getCurrentDate, divideArrToChunks, importHistoricalStockData, writeToCsv } = require('./yahoo-historical.js');
 const { getStockNames } = require('./readStocks.js');
const { updateDB } = require('../DAL/updateDB.js');


// Check if a given path exists
function pathExists(path) {
    try {
        fs.accessSync(path);
        return true;
    } catch (error) {
        return false;
    }
}

// Read data from a CSV file
function readFromCsv(path) {
    if (!pathExists(path)) {
        console.error(`Error reading file, no such file or directory ${path}`);
        return null;
    }
    try {
        return fs.readFileSync(path, 'utf8');
    } catch (err) {
        console.error('Error reading file:', err);
        return null;
    }
}

// Parse CSV data into JSON format
function parseCsvDataToJson(csvData) {
    if (!csvData) return null;
    const lines = csvData.split('\n');
    if (lines.length === 0) return null;
    const headers = lines[0].split(',');
    const dataArray = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const values = lines[i].split(',').map(item => item.trim());
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        dataArray.push(obj);
    }
    return dataArray;
}

// Fetch current stock data for a given item
async function currentStock(item) {
    try {
        console.log(`Fetching data for ${item}`);
        const quotes = await importHistoricalStockData(item, getYesterdayDate(), getCurrentDate());

        if (!quotes) {
            console.error(`No quotes returned for ${item}`);
            return null;
        }

        return quotes.map(quote => ({ ...quote, Symbol: item }));

    } catch (error) {
        console.error(`Error fetching data for ${item}:`, error);
        return null;
    }
}

// Delay execution for a given number of milliseconds
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const allQuotes = [];

// Main update function to fetch and process stock data
async function update() {
    try {
          const stockNames = await getStockNames();
        // const stockNames=['AAGR'];
        const chunks = divideArrToChunks(stockNames);
        const specificLetters = new Set(['C', 'K', 'O', 'S', 'W']);

        for (const chunk of chunks) {
            if (chunk.some(symbol => specificLetters.has(symbol[0].toUpperCase()))) {
                console.log("Taking  break" );
                await delay(2 * 60 * 1000); // 7 minutes delay
            }

            for (const item of chunk) {
             
                try {
                    const quotes = await currentStock(item);
                    if (!quotes) {
                        console.error(`No quotes returned for ${item}`);
                        continue;
                    }
                    allQuotes.push(...quotes);

                    let data = readFromCsv(`C:/ProjectBursa/BLL/Stocks/${item}.csv`);
                    let csvData = parseCsvDataToJson(data);

                    if (!csvData) {
                        console.error(`No CSV data found for ${item}`);
                        csvData = [];
                    }

                    csvData = [...csvData, ...quotes];
                    writeToCsv(item, csvData);

                } catch (error) {
                    console.error(`Error processing ${item}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error updating stocks:', error);
    }

    // Update the database with all collected quotes
    try {
        await updateDB(allQuotes);
    } catch (error) {
        console.error('Error updating database:', error);
    }
}

// Export functions for external use
module.exports = { readFromCsv, currentStock, update };


