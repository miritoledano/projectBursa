// updateDB.js

const SQLServerAdapter = require('../Adapters/SQLServerAdapter');
const { getStockNames } = require('../BLL/readStocks');
const { update } = require('../BLL/update');
const schedule = require('node-schedule');

const dotenv = require('dotenv');
dotenv.config({ path: 'C:\\ProjectBursa\\.env' });

async function updateDB() {
    const pLimit = await import('p-limit').then(module => module.default);
//    const names=['zyxi','zyme','zws','zvsa','zvra','zvia','zura','zuo'];
    const data = await update();
     const names = await getStockNames();
    const adapter = new SQLServerAdapter(process.env.CONNECTION_STRING);
    let conn;

    try {
        conn = await adapter.connect();
        const limit = pLimit(100); // הגבלת מקביליות ל-100

        const promises = names.map(symbol => limit(async () => {
            console.log(`מעדכן נתונים עבור ${symbol}...`);

            if (data.length > 0) {
                const insertPromises = data.map(async row => {
                    const { date, open, high, low, close, volume } = row;

                    // בדיקת תקינות ותיקון תאריך
                    const dateObj = new Date(date);
                    if (isNaN(dateObj.getTime())) {
                        console.error(`פורמט תאריך שגוי בנתוני API עבור ${symbol}: ${date}`);
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
                console.error(`לא נמצאו נתונים עבור ${symbol}`);
            }

            // הוספת השהייה בין קריאות API כדי להימנע ממגבלות קצב
            // await delay(1000);
        }));

        await Promise.all(promises);
        console.log(`העדכון הסתיים ב-${new Date().toLocaleString()}`);
    } catch (error) {
        console.error('שגיאה במהלך העדכון:', error.message);
    } finally {
        // סגירת חיבור לבסיס הנתונים
        if (conn) {
            await adapter.disconnect();
            console.log('התנתקות מבסיס הנתונים');
        }
    }
}

// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

function DailyUpdate() { 
    schedule.scheduleJob('30 16 * * *', updateDB);
}



module.exports = { DailyUpdate };
