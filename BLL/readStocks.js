const fs = require("fs");
const path = require("path");

const folderPath = path.join(__dirname, "Stocks");
let stockNames = [];

async function loadStockNamesFromFiles() {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error("Error reading the directory:", err);
        reject(err);
        return;
      }

      files.forEach((file) => {
        if (file.endsWith(".csv")) {
          const stockSymbol = path.basename(file, ".csv");
          stockNames.push(stockSymbol);
        }
      });

      resolve(stockNames);
    });
  });
}

async function getStockNames() {
  if (stockNames.length === 0) {
    await loadStockNamesFromFiles();
  }
  return stockNames;
}

module.exports = {
  loadStockNamesFromFiles,
  getStockNames
};
