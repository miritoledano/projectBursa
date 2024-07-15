const yahooFinance = require('yahoo-finance2').default;
const IStockAdapter = require('./IStockAdapter');

class YahooFinanceAdapter extends IStockAdapter {
  async fetchHistoricalData(symbol, start, end) {
    try {
      const quote = await yahooFinance.historical(symbol, {
        period1: start,
        period2: end,
      });
      return quote;
    } catch (error) {
      if (error.code === 404) {
        console.error(`לא נמצאו נתוני היסטוריה עבור ${symbol} בין התאריכים: ${start}, ${end}`);
      } else if (error.code === 502) {
        console.error(`שגיאת תקשורת עבור ${symbol}, מנסה שוב בעוד זמן מה...`);
        await this.delay(5000); // המתנה של 5 שניות לפני נסיון נוסף
        return await this.fetchHistoricalData(symbol, start, end);
      } else {
        console.error(`שגיאה בהבאת נתונים עבור ${symbol}:`, error);
      }
      return null;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = YahooFinanceAdapter;
