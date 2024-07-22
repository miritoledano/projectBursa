const SQLServerAdapter = require('../Adapters/SQLServerAdapter');
const { getStockNames } = require('../BLL/readStocks');
const { update } = require('../BLL/update');
const schedule = require('node-schedule');
const dotenv = require('dotenv');
dotenv.config({ path: 'C:\\ProjectBursa\\.env' });

async function updateDB() {
    const data = await update();
    const names = await getStockNames();
    const adapter = new SQLServerAdapter(process.env.CONNECTION_STRING);
    let conn;

    try {
        conn = await adapter.connect();
 
        const allPromises = names.map(async (symbol) => {
            if (data.length > 0) {
                console.log(`Updating data for ${symbol}...`);
                const insertPromises = data.map(async (row) => {
                    const { date, open, high, low, close, volume } = row;

                    // בדיקת תקינות ותיקון תאריך
                    const dateObj = new Date(date);
                    if (isNaN(dateObj.getTime())) {
                        console.error(`Incorrect date format in API data for ${symbol}: ${date}`);
                        return;
                    }
                    const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;

                    // בניית שאילתת הכנסה
                    const insertQuery = `
                        INSERT INTO STOCKPRICES (Symbol, [date], [open], high, low, [close], volume)
                        VALUES ('${symbol}', '${formattedDate}', ${open}, ${high}, ${low}, ${close}, ${volume})
                    `;

                    await adapter.query(insertQuery);
                });

                await Promise.all(insertPromises);
            } else {
                console.error(`No data found for ${symbol}`);
            }
        });

        await Promise.all(allPromises);
        console.log(`Finished update at ${new Date().toLocaleString()}`);
    } catch (error) {
        console.error('Error during update:', error.message);
    } finally {
        // סגירת חיבור לבסיס הנתונים
        if (conn) {
            await adapter.disconnect();
            console.log('Disconnected from the database');
        }
    }
}

function DailyUpdate() { 
    schedule.scheduleJob('30 16 * * *', updateDB);
}
// DailyUpdate();
updateDB();

module.exports = { DailyUpdate };
