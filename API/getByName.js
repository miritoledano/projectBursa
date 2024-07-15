const { getDBAdapter } = require('../DAL/connectDB');

async function getByName(req, res) {
    const { symbol } = req.params; // Destructure symbol property
    const adapter = getDBAdapter();
    const query = 'SELECT * FROM STOCKPRICES WHERE Symbol = ?';

    try {
        const result = await adapter.query(query, [symbol]);
        console.log('Stock data:', result);
        res.json(result);
    } catch (err) {
        console.error('Error fetching stock data:', err);
        res.status(500).json({ error: 'Error fetching stock data' });
    }
}

module.exports = { getByName };
