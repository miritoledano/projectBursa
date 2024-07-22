// IStockAdapter.js
class IStockAdapter {
    async fetch(symbol, start, end) {
      throw new Error("problem in fetchHistoricalData function");
    }
  }
  
  module.exports = IStockAdapter;
  