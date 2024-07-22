const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const EODAdapter = require('../Adapters/EODAdapter');
const stockAdapter = new EODAdapter();
const csvParser = require('csv-parser');

const csvFilePath = '../data/StockList.csv';
let names = [];

async function createStockNamesArr(filePath) {
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        names.push(data['Symbol']);
      })
      .on('end', resolve)
      .on('error', reject);
  });
}

function divideArrToChunks(arr, chunkSize = 1000) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

async function fetchDataForDates(start, end) {
  await createStockNamesArr(csvFilePath);
  const chunks = divideArrToChunks(names);

  for (const chunk of chunks) {
    // Check for the first letter to decide if we need to take a break
    if (chunk.some(symbol => symbol[0].toUpperCase() === 'K')) {
      console.log("Taking a break for 7 minutes at letter 'K'...");
      await delay(4 * 60 * 1000); // 7 minutes delay
    }

    await processChunk(chunk, start, end);
    await delay(700); // Delay to avoid server overload
  }
}

async function processChunk(chunk, start, end) {
  for (const item of chunk) {
    const quotes = await importHistoricalStockData(item, start, end);
    if (quotes && quotes.length > 0) {
      writeToCsv(item, quotes);
    }
  }
}

async function importHistoricalStockData(symbol, start, end) {
  try {
    const quote = await stockAdapter.fetchHistoricalData(symbol, start, end);
    return quote;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

function writeToCsv(symbol, quotes) {
  if (!quotes) {
    console.error(`Error writing to CSV: undefined quotes for ${symbol}`);
    return;
  }

  const folderName = 'Stocks';
  const folderPath = path.join(__dirname, folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const csvWriter = createCsvWriter({
    path: `${folderPath}/${symbol}.csv`,
    header: [
      { id: 'date', title: 'date' },
      { id: 'open', title: 'open' },
      { id: 'high', title: 'high' },
      { id: 'low', title: 'low' },
      { id: 'close', title: 'close' },
      { id: 'volume', title: 'volume' },
    ],
  });

  csvWriter
    .writeRecords(quotes)
    .then(() => console.log(`CSV file for ${symbol} has been saved successfully`))
    .catch((error) => {
      console.error(`Error writing CSV file for ${symbol}:`, error);
    });
}

function getCurrentDate() {
  return new Date();
}

function getYesterdayDate() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return yesterday;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  divideArrToChunks,
  importHistoricalStockData,
  writeToCsv,
  getCurrentDate,
  getYesterdayDate,
  delay,
  fetchDataForDates
};
