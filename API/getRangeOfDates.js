const { getDBAdapter } = require('../DAL/connectDB');

async function getRangeOfDates(req, res) {
    const adapter = getDBAdapter();
    const { startDate, endDate } = req.params;
    const query = 'SELECT * FROM STOCKPRICES WHERE date >= ? AND date <= ?';

    try {
        const rows = await adapter.query(query, [startDate, endDate]);
        console.log('נתוני המניות הם:', rows);
        res.json(rows); // שלח את השורות כתגובה
    } catch (err) {
        console.error('שגיאה בקריאת נתוני המניות:', err.message);
        res.status(500).json({ error: 'Error fetching stock data' }); // שלח הודעת שגיאה כתגובה
    }
}

module.exports = { getRangeOfDates };
