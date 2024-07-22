const express = require('express');
const cors = require('cors');
const { connectToDB } = require('./DAL/connectDB');
// const { DailyUpdate } = require('./DAL/updateDB');
const getAllStocksRouter = require('./routes/getAllStocks '); // הוספת ראוטר למנהל קצבים 
const getRangeOfDatesRouter = require('./routes/getRangeOfDatesRouter');
const getByNameRouter = require('./routes/getByName');
const getStocksByDateRouter = require('./routes/getStocksByDateRouter');
const {errorHandling}=require('./middlweres/errorHandling');
const app = express();

app.use(cors());
app.use(express.json());
connectToDB()
    .then(() => {
        console.log('Successfully connected to the database');
        // DailyUpdate(); // Run daily updates after connecting to the database
    })
    .catch(err => {
        console.error('Failed to connect to the database:', err.message);
        process.exit(1); // Exit the process if unable to connect to the database
    });

// Use routers
app.use('/api/getAllStocks', getAllStocksRouter);
app.use('/api/getRangeOfDates', getRangeOfDatesRouter);
app.use('/api/getByName', getByNameRouter);
app.use('/api/getStocksByDate', getStocksByDateRouter);
app.use(errorHandling)

const port = process.env.PORT || 3500;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
