// EODAdapter.js
const YahooFinanceAdapter = require('./YahooFinanceAdapter');
const IStockAdapter = require('./IStockAdapter');

class EODAdapter extends IStockAdapter {
    constructor() {
        super();
        this.adapter = new YahooFinanceAdapter();
    }

    async fetchHistoricalData(symbol, start, end) {
        return await this.adapter.fetchHistoricalData(symbol, start, end);
    }
}

module.exports = EODAdapter;
