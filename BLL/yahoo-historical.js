// const yahooFinance = require('yahoo-finance2').default;
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const fs = require('fs');
// const csvParser = require('csv-parser');
// const path = require('path');

// let names = [];


// const csvFilePath = 'StockList.csv';

// async function createStockNamesArr(path) {
//   await new Promise((resolve, reject) => {
//     fs.createReadStream(path)
//       .pipe(csvParser())
//       .on('data', (data) => {
//         names.push(data['Symbol']);
//       })
//       .on('end', resolve)
//       .on('error', reject);
//   });
// }


// function divideArrToChunks(arr) {
//   let chunkSize = 1000;
//   let chunks = [];
//   for (let i = 0; i < arr.length; i += chunkSize) {
//     chunks.push(arr.slice(i, i + chunkSize));
//   }
//   return chunks;
// }

// async function fetchDataForDates(start, end) {
//   await createStockNamesArr(csvFilePath);
//   // names2 = filterSymbols(names); // שמור את התוצאה במערך החדש names2
//   let chunks = divideArrToChunks(names);
//   for (let chunk of chunks) {
//     await processChunk(chunk, start, end);
//     await delay(700); // השהייה של 1000 מ"ש בין כל מקטע כדי למנוע עומס על השרת
//     console.log("Processed chunk");
//   }
//   console.log(names); // להדפסת השמות שנוספו למערך
// }

// async function processChunk(chunk, start, end) {
//   for (let item of chunk) {
//     console.log(item);
//     let quotes = await importHistoricalStockData(item, start, end);
//     if (quotes && quotes.length > 0) {
//       writeToCsv(item, quotes);
//     }
//   }
// }

// async function importHistoricalStockData(symbol, start, end) {
//   let quote;
//   try {
//     quote = await yahooFinance.historical(symbol, {
//       period1: start,
//       period2: end,
//     });
//     console.log(`yahoo finance finished successfully for ${symbol}`);
//   } catch (error) {
//     if (error.code == 404)
//       console.error(`Not Found historical data for ${symbol} between dates: ${start}, ${end}`);
//     else
//       console.error(`Error fetching data for ${symbol}:`, error);
//   }
//   return quote;
// }

// function getCurrentDate() {
//   const today = new Date();
//   return today;
// }

// function  getYesterdayDate() {
//   const today = new Date();
//   const yesterday = new Date(today);
//   yesterday.setDate(today.getDate() - 1);
//   return yesterday;
// }

// function writeToCsv(symbol, quotes) {
//   if (!quotes) {
//     console.error(`Error writing to csv file: undefined quotes for ${symbol}`);
//     return;
//   }

//   const folderName = `Stocks`;
//   const folderPath = path.join(__dirname, folderName);

//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath);
//   }
//   const csvWriter = createCsvWriter({
//     path: `${folderPath}/${symbol}.csv`,
//     header: [
//       { id: 'date', title: 'date' },
//       { id: 'open', title: 'open' },
//       { id: 'high', title: 'high' },
//       { id: 'low', title: 'low' },
//       { id: 'close', title: 'close' },
//       { id: 'volume', title: 'volume' },
//     ],
//   });

//   csvWriter
//     .writeRecords(quotes)
//     .then(() => console.log(`CSV file for ${symbol} has been saved successfully`))
//     .catch((error) => {
//       console.error(`Error writing CSV file for ${symbol}:`, error);
//     });
// }

// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }



// module.exports = { getYesterdayDate, delay, writeToCsv, getCurrentDate, importHistoricalStockData, divideArrToChunks, createStockNamesArr, getYesterdayDate, fetchDataForDates, csvFilePath };
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const EODAdapter = require('../Adapters/EODAdapter');
const stockAdapter = new EODAdapter();

const csvParser = require('csv-parser');

const csvFilePath = '../data/StockList.csv';
let names = [];

async function createStockNamesArr(path) {
  await new Promise((resolve, reject) => {
    fs.createReadStream(path)
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




