// getAllStocks.js
const { getDBAdapter } = require('../DAL/connectDB');
const NodeCache = require('node-cache');
const zlib = require('zlib'); // ספריית דחיסה
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 120 }); // קביעת זיכרון המטמון עם TTL 0 כדי לאפשר שמירת נתונים לנצח

// ייבוא הגדרות הקונפיגורציה
const config = require('../Configuration/Config.json');

async function getAllStocks(req, res, next) {
    const adapter = getDBAdapter();
    const query = 'SELECT * FROM STOCKPRICES';
    
    // בדיקה אם להשתמש ב- node-cache על פי ההגדרה בקובץ הקונפיגורציה
    if (config.useNodeCache) {
        const cachedData = myCache.get('stockPrices');
        if (cachedData) { 
            console.log('The stock data was found in cache memory (compressed)');
            const decompressedData = zlib.gunzipSync(cachedData); // פריסת נתונים
            const parsedData = JSON.parse(decompressedData.toString());
            res.json(parsedData);
            return;
        }
    }

    try {
        // שליפת נתונים ממסד הנתונים במידה ולא נמצאו בזיכרון
        const rows = await adapter.query(query);
        console.log('The stock data was extracted from the database');

        if (!rows || rows.length === 0) {
            throw new Error('No data found in database.');
        }

        // דחיסת כל הנתונים ושמירתם בזיכרון המטמון
        if (config.useNodeCache) {
            const compressedData = zlib.gzipSync(JSON.stringify(rows));
            myCache.set('stockPrices', compressedData);
            console.log('The stock data was found in cache memory (compressed)');
        }
        
        res.json(rows);
    } catch (err) {
        const error = new Error('Error reading stock data');
        error.status = 500;
        next(error);
    }
}

module.exports = { getAllStocks };
