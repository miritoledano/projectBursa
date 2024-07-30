const SQLServerAdapter = require('../Adapters/SQLServerAdapter');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: 'C:\\ProjectBursa\\.env' });

async function createCSVFile(filePath, allQuotes) {
  console.log(`Creating CSV file at: ${filePath}`);
  const writeStream = fs.createWriteStream(filePath);
  
  // Write the header row
  writeStream.write('Symbol,date,open,high,low,close,volume\n');

  // Write the data rows
  allQuotes.forEach(row => {
      const { Symbol, date, open, high, low, close, volume } = row;
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
          const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
          writeStream.write(`${Symbol},${formattedDate},${open},${high},${low},${close},${volume}\n`);
      } else {
          console.error(`Incorrect date format in API data for ${Symbol}: ${date}`);
      }
  });

  writeStream.end();
  console.log('CSV file creation completed');
}
async function bulkInsert(filePath) {
    console.log('Starting bulk insert');
    const adapter = new SQLServerAdapter(process.env.CONNECTION_STRING);
    let conn;

    try {
        conn = await adapter.connect();

        // Create temporary table
        await adapter.query(`
            CREATE TABLE #TempStockPrices (
                Symbol NVARCHAR(10),
                [date] DATE,
                [open] FLOAT,
                high FLOAT,
                low FLOAT,
                [close] FLOAT,
                volume INT
            );
        `);

        // Perform bulk insert into temporary table
        const bulkInsertQuery = `
            BULK INSERT #TempStockPrices
            FROM '${filePath}'
            WITH (
                FIELDTERMINATOR = ',',
                ROWTERMINATOR = '\n',
                FIRSTROW = 2
            )
        `;

        await adapter.query(bulkInsertQuery);

        // Transfer data from temp table to main table
        await adapter.query(`
            INSERT INTO STOCKPRICES (Symbol, [date], [open], high, low, [close], volume)
            SELECT Symbol, [date], [open], high, low, [close], volume
            FROM #TempStockPrices;
        `);

        // Drop temporary table
        await adapter.query('DROP TABLE #TempStockPrices');
        
        console.log('Bulk insert completed successfully');
        
    } catch (error) {
        console.error('SQL Server query error:', error.message);
    } finally {
        if (conn) {
            await adapter.disconnect();
            console.log('Disconnected from the database');
        }
    }
}

async function updateDB(allQuotes, fileName = 'update.csv') {
    const csvFilePath = path.join(__dirname, fileName);

    try {
        console.log('Starting updateDB process');

        // Create CSV file
        await createCSVFile(csvFilePath, allQuotes);

        // Perform bulk insert from CSV file
        await bulkInsert(csvFilePath);

        // Delete the CSV file
        fs.unlinkSync(csvFilePath);
        console.log('CSV file deleted');
    } catch (error) {
        console.error('Error during update:', error.message);
    }
}

module.exports = { updateDB };
