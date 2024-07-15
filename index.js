const express = require('express');
const cors = require('cors');
const { DailyUpdate } = require('./DAL/updateDB');
const { connectToDB } = require('./DAL/connectDB');
const { getByName } = require('./API/getByName');
const { getStocksByDate } = require('./API/getStocksByDate');
const {getAllStocks} = require('./API/getStocks');
const {getRangeOfDates} = require('./API/getRangeOfDates');

const app = express();

app.use(cors());
app.use(express.json());

connectToDB()
    .then(() => {
        console.log('Successfully connected to the database');
        DailyUpdate(); // Run daily updates after connecting to the database
    })
    .catch(err => {
        console.error('Failed to connect to the database:', err.message);
        process.exit(1); // Exit the process if unable to connect to the database
    });

// Define routes directly without using a router object
app.get("/api/getAllStocks", getAllStocks);
app.get("/api/getRangeOfDates", getRangeOfDates); // שם להתקנת ב
app.get("/api/getByName", getByName);
app.get("/api/getStocksByDate", getStocksByDate);

const port = process.env.PORT || 3500;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
