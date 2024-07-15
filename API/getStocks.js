const { getDBAdapter } = require('../DAL/connectDB');
const NodeCache = require('node-cache');
const zlib = require('zlib'); // ספריית דחיסה

const myCache = new NodeCache({ stdTTL: 0, checkperiod: 120 }); // קביעת זיכרון המטמון עם TTL 0 כדי לאפשר שמירת נתונים לנצח

async function getAllStocks(req, res) {
    const adapter = getDBAdapter();
    const query = 'SELECT * FROM STOCKPRICES';

    // ניסיון לשלוף נתונים מהזיכרון
    const cachedData = myCache.get('stockPrices');
    if (cachedData) {
        console.log('נתוני המניות נמצאו בזיכרון מטמון (דחוסים):', cachedData);
        const decompressedData = zlib.gunzipSync(cachedData); // פריסת נתונים
        const parsedData = JSON.parse(decompressedData.toString());
        console.log('נתוני המניות לאחר פריסה:', parsedData);
        res.json(parsedData);
        return;
    }

    try {
        let allRows = [];
        let offset = 0;
        const batchSize = 50; // גודל הצ׳אנק שאנחנו מחזירים בכל פעם

        while (true) {
            const rows = await adapter.query(`${query} LIMIT ${batchSize} OFFSET ${offset}`);
            if (!rows || rows.length === 0) break;
            allRows = allRows.concat(rows);
            offset += batchSize;
        }

        if (allRows.length === 0) {
            throw new Error('No data found in database.');
        }

        // דחיסת כל הנתונים ושמירתם בזיכרון המטמון
        const compressedData = zlib.gzipSync(JSON.stringify(allRows));
        myCache.set('stockPrices', compressedData);
        console.log('נתוני המניות נשמרו בזיכרון המטמון (דחוסים).');

        // החזרת הנתונים בפעם אחת כמבנה JSON
        res.json(allRows);
    } catch (err) {
        console.error('שגיאה בקריאת נתוני המניות:', err.message);
        res.status(500).json({ error: 'Error fetching stock data' });
    }
}

module.exports = { getAllStocks };
