const { getDBAdapter } = require('../DAL/connectDB');
async function getStocksByDate(req, res,next) {
    const adapter = getDBAdapter();
    const { date } = req.params;
    const query = 'SELECT * FROM STOCKPRICES WHERE date = ?';
    try {
        const rows = await adapter.query(query, [date]); // שים לב לשימוש במערך כאן
        console.log('The stock figures are:', rows);
        
        if (rows.length === 0) {
            return res.status(404).json({
                type: 'error',
                message: `No data found for the date ${date}`
            });
        }
        return res.json(rows); // ניתן להחזיר את השורות אם יש צורך בעיבוד נוסף
    } catch (err) {

        const error = new Error("Error reading stock data:");
        error.status = 500;
        next(error);  
    }
}

module.exports = { getStocksByDate };
