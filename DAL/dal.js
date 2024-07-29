const SQLServerAdapter = require('../Adapters/SQLServerAdapter');
const dotenv = require('dotenv');

dotenv.config({ path: 'C:\\ProjectBursa\\.env' });

async function updateDB(allQuotes) {
    const adapter = new SQLServerAdapter(process.env.CONNECTION_STRING);
    let conn;
try {
        conn = await adapter.connect();
       const insertPromises = allQuotes.map(async (row) => {
            const { Symbol, date, open, high, low, close, volume } = row;

            // Handle date
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                console.error(`Incorrect date format in API data for ${Symbol}: ${date}`);
                return;
            }
            const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;

            // Build insert query
            const insertQuery = `
                INSERT INTO STOCKPRICES (Symbol, [date], [open], high, low, [close], volume)
                VALUES ('${Symbol}', '${formattedDate}', ${open}, ${high}, ${low}, ${close}, ${volume})
            `;

            // Execute insert
            try {
                await adapter.query(insertQuery);
            } catch (error) {
                console.error('SQL query error:', error.message);
            }
        });

        await Promise.all(insertPromises);
    } catch (error) {
        console.error('Error during update:', error.message);
    } finally {
        if (conn) {
            await adapter.disconnect();
            console.log('Disconnected from the database');
        }
    }
}

module.exports = { updateDB };
