const { getDBAdapter } = require('../DAL/connectDB');

async function getStocksByDate(req, res) {
    const adapter = getDBAdapter();
    const { date } = req.params;
    
    const query = 'SELECT * FROM STOCKPRICES WHERE date = ?';
    try {
        console.log("tbh kmjn")
        const rows = await adapter.query(query, [date]); // שים לב לשימוש במערך כאן
        console.log('נתוני המניות הם:', rows);
        if (rows.length === 0) {
            console.log(`אין נתונים לתאריך ${date}`);
        }
        return rows; // ניתן להחזיר את השורות אם יש צורך בעיבוד נוסף
    } catch (err) {
        console.error('שגיאה בקריאת נתוני המניות:', err.message);
        throw err; // זרוק מחדש את השגיאה כדי לטפל בה במקום אחר במידת הצורך
    }
}

module.exports = { getStocksByDate };
