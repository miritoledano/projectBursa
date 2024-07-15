const { loadStockNamesFromFiles } = require('../readStocks');
const {read_from_csv} =require('../BLL/update');
const dotenv=require('dotenv');
dotenv.config();
const SQLServerAdapter =require('../Adapters/SQLServerAdapter');

async function createTableSymbol(conn, names) {
    console.log("hbgg")
    // בדיקת קיום הטבלה "STOCKS"
    const checkTableQuery = `
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'STOCKS')
        BEGIN
            CREATE TABLE STOCKS (
                Symbol VARCHAR(55) PRIMARY KEY
            )
        END
    `;
    await conn.query(checkTableQuery);
    for (const symbol of names) {
        const insertQuery = `
        INSERT INTO STOCKS(Symbol)
        VALUES ('${symbol}')
    `;
    await conn.query(insertQuery);        
   }
}

async function createTableSymbolPrice(conn, names) {
     console.log("knbjhvg")
    const createStockPricesTableQuery = `
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'STOCKPRICES')
    BEGIN
        CREATE TABLE STOCKPRICES (
            Symbol VARCHAR(55),
            [date] DATE,
            [open] FLOAT,
            high FLOAT,
            low FLOAT,
            [close] FLOAT,
            volume BIGINT,
            PRIMARY KEY (Symbol, [date]),
            FOREIGN KEY (Symbol) REFERENCES STOCKS(Symbol)
        )
    END
    `;
 await conn.query(createStockPricesTableQuery);
    for (const symbol of names) {
        const csvPath = `Stocks/${symbol}.csv`;
        const csvData = read_from_csv(csvPath);

        if (csvData) {
            const rows = csvData.split('\n').slice(1); // Assuming the first row is the header

            for (const row of rows) {
                const [date, open, high, low, close, volume] = row.split(',');
                const dateObj = new Date(date);

                // Check if dateObj is valid
                if (isNaN(dateObj.getTime())) {
                    console.error(`Invalid date format in CSV for ${symbol}: ${date}`);
                    continue;
                }

                const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
                const insertQuery = `
                    INSERT INTO STOCKPRICES (Symbol, [date], [open], high, low, [close], volume)
                    VALUES ('${symbol}', '${formattedDate}', ${open}, ${high}, ${low}, ${close}, ${volume})
                `;
                await conn.query(insertQuery);
            }
        }
    }
}

async function runDatabaseOperations() {
   const adapter=new SQLServerAdapter(process.env.CONNECTION_STRING);
     await adapter.connect();
    try {
        // טוען את השמות מהקובץ
        const names = await loadStockNamesFromFiles();
        // קורא לפונקציה ליצירת הטבלה והכנסת הנתונים
         await createTableSymbol(adapter, names);
        await createTableSymbolPrice(adapter,names);
    } catch (error) {
        console.error('שגיאה במהלך פעולות מסד הנתונים:', error.message);
    } 
    await adapter.disconnect();
}

runDatabaseOperations();







// const { connectToDatabase, closeConnection } = require('C:/ProjectBursa/conectionDB.js');
// await new Promise((resolve, reject) => {
    //     conn.query(checkTableQuery, (queryErr) => {
    //         if (queryErr) {
    //             console.error(`שגיאה ביצירת הטבלה:`, queryErr.message);
    //             reject(queryErr);
    //         } else {
    //             console.log(`הטבלה STOCKS נוצרה או קיימת כבר`);
    //             resolve();
    //         }
    //     });
    // });

    // הכנסת נתונים לטבלה
    //         await new Promise((resolve, reject) => {
//             conn.query(insertQuery, (queryErr) => {
//                 if (queryErr) {
//                     console.error(`שגיאה בהכנסת נתונים עבור ${symbol}:`, queryErr.message);
//                     reject(queryErr);
//                 } else {
//                     console.log(`הנתונים עבור ${symbol} הוכנסו בהצלחה`);
//                     resolve();
//                 }
//             });
//         });

 // await new Promise((resolve, reject) => {
    //     conn.query(createStockPricesTableQuery, (queryErr) => {
    //         if (queryErr) {
    //             console.error(`שגיאה ביצירת הטבלה:`, queryErr.message);
    //             reject(queryErr);
    //         } else {
    //             console.log(`הטבלה STOCKPRICES נוצרה או קיימת כבר`);
    //             resolve();
    //         }
    //     });
    // });
    
                // await new Promise((resolve, reject) => {
                //     conn.query(insertQuery, (queryErr) => {
                //         if (queryErr) {
                //             console.error(`Error inserting data into ${symbol}:`, queryErr.message);
                //             reject(queryErr);
                //         } else {
                //             console.log(`Data inserted into ${symbol} successfully`);
                //             resolve();
                //         }
                //     });
                // });

                // async function createTableSymbolPrice(conn, names) {
//     const createStockPricesTableQuery = `
//     IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'STOCKPRICES')
//     BEGIN
//         CREATE TABLE STOCKPRICES (
//             Symbol VARCHAR(55),
//             [date] DATE,
//             [open] FLOAT,
//             high FLOAT,
//             low FLOAT,
//             [close] FLOAT,
//             volume FLOAT,
//             PRIMARY KEY (Symbol, [date]),
//             FOREIGN KEY (Symbol) REFERENCES STOCKS(Symbol)
//         )
//     END
//     `;

//     await new Promise((resolve, reject) => {
//         conn.query(createStockPricesTableQuery, (queryErr) => {
//             if (queryErr) {
//                 console.error(`שגיאה ביצירת הטבלה:`, queryErr.message);
//                 reject(queryErr);
//             } else {
//                 console.log(`הטבלה STOCKPRICES נוצרה או קיימת כבר`);
//                 resolve();
//             }
//         });
//     });

//     for (const symbol of names) {
//         const csvPath = `Stocks/${symbol}.csv`;
//         const csvData = read_from_csv(csvPath);

//         if (csvData) {
//             const rows = csvData.split('\n').slice(1); // Assuming the first row is the header

//             for (const row of rows) {
//                 const [date, open, high, low, close, volume] = row.split(',');
//                 const dateObj = new Date(date);

//                 // Check if dateObj is valid
//                 if (isNaN(dateObj.getTime())) {
//                     console.error(`Invalid date format in CSV for ${symbol}: ${date}`);
//                     continue;
//                 }

//                 const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;

//                 // בדוק אם הרשומה כבר קיימת
//                 const checkQuery = `
//                     SELECT COUNT(*) as count FROM STOCKPRICES
//                     WHERE Symbol = '${symbol}' AND [date] = '${formattedDate}'
//                 `;

//                 const [existingRows] = await new Promise((resolve, reject) => {
//                     conn.query(checkQuery, (queryErr, result) => {
//                         if (queryErr) {
//                             console.error(`Error checking existing data for ${symbol}:`, queryErr.message);
//                             reject(queryErr);
//                         } else {
//                             resolve(result);
//                         }
//                     });
//                 });

//                 if (existingRows.count > 0) {
//                     // רשומה קיימת - בצע עדכון
//                     const updateQuery = `
//                         UPDATE STOCKPRICES
//                         SET [open] = ${open}, high = ${high}, low = ${low}, [close] = ${close}, volume = ${volume}
//                         WHERE Symbol = '${symbol}' AND [date] = '${formattedDate}'
//                     `;

//                     await new Promise((resolve, reject) => {
//                         conn.query(updateQuery, (queryErr) => {
//                             if (queryErr) {
//                                 console.error(`Error updating data in ${symbol}:`, queryErr.message);
//                                 reject(queryErr);
//                             } else {
//                                 console.log(`Data updated in ${symbol} successfully`);
//                                 resolve();
//                             }
//                         });
//                     });
//                 } else {
//                     // רשומה לא קיימת - בצע הוספה
//                     const insertQuery = `
//                         INSERT INTO STOCKPRICES (Symbol, [date], [open], high, low, [close], volume)
//                         VALUES ('${symbol}', '${formattedDate}', ${open}, ${high}, ${low}, ${close}, ${volume})
//                     `;

//                     await new Promise((resolve, reject) => {
//                         conn.query(insertQuery, (queryErr) => {
//                             if (queryErr) {
//                                 console.error(`Error inserting data into ${symbol}:`, queryErr.message);
//                                 reject(queryErr);
//                             } else {
//                                 console.log(`Data inserted into ${symbol} successfully`);
//                                 resolve();
//                             }
//                         });
//                     });
//                 }
//             }
//         }
//     }
// }