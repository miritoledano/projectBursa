const { getDBAdapter } = require('../DAL/connectDB');

async function getByName(req, res,next) {
    const { symbol } = req.params; // Destructure symbol property
     const adapter = getDBAdapter();
    const query = 'SELECT * FROM STOCKPRICES WHERE Symbol = ?';

    try {
        const result = await adapter.query(query, [symbol]);
        res.json(result);
    } catch (err) {
        const error = new Error("Error fetching stock data");
        error.status = 500;
        next(error);      
    }
}

module.exports = { getByName };
