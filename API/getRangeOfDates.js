const { getDBAdapter } = require('../DAL/connectDB');

async function getRangeOfDates(req, res, next) {
    const adapter = getDBAdapter();
    const { startDate, endDate } = req.params;

    // בדיקה אם התאריכים נשלחו בצורה נכונה
    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Both startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // בדיקה אם התאריכים תקינים
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
    }

    // בדיקה אם startDate לפני endDate
    if (start > end) {
        return res.status(400).json({ error: "startDate must be before endDate" });
    }

    // בדיקה אם התאריכים נופלים בטווח של שנה אחת
    const oneYear = 365 * 24 * 60 * 60 * 1000; // שנה במילישניות
    if ((end - start) > oneYear) {
        return res.status(400).json({ error: "Date range cannot exceed one year" });
    }

    const query = 'SELECT * FROM STOCKPRICES WHERE date >= ? AND date <= ?';
    try {
        const rows = await adapter.query(query, [startDate, endDate]);
        res.json(rows); // שלח את השורות כתגובה
    } catch (err) {
        const error = new Error("Error fetching stock data");
        error.status = 500;
        next(error);
    }
}

module.exports = { getRangeOfDates };
