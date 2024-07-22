const fs = require('fs');
const { getYesterdayDate, getCurrentDate, divideArrToChunks, importHistoricalStockData, writeToCsv } = require('./yahoo-historical.js');
const { getStockNames } = require('./readStocks.js');

function pathExists(path) {
    try {
        fs.accessSync(path);
        return true;
    } catch (error) {
        return false;
    }
}

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

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function update() {
    try {
        const stockNames = await getStockNames();
        const chunks = divideArrToChunks(stockNames);
        const allQuotes = [];
        const specificLetters = new Set(['C', 'K', 'O', 'S', 'W']);

        for (const chunk of chunks) {
            if (chunk.some(symbol => specificLetters.has(symbol[0].toUpperCase()))) {
                console.log(`Taking a break for 2 minutes for stocks starting with one of ${[...specificLetters].join(', ')}...`);
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
        return allQuotes;
    } catch (error) {
        console.error('Error updating stocks:', error);
        return [];
    }
}

module.exports = { readFromCsv, currentStock, update };
