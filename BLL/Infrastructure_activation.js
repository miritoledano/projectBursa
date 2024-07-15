const {fetchDataForDates,getYesterdayDate}=require('./yahoo-historical.js');
fetchDataForDates('2024-01-01', getYesterdayDate());













// const axios = require('axios');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const fs = require('fs');

// const ALPHA_VANTAGE_API_KEY = 'LPHW41XE6OMWSCUU'; // מפתח ה-API שלך
// async function fetchStockSymbols() {
//     try {
//       const response = await axios.get(`https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${ALPHA_VANTAGE_API_KEY}`);
//       const data = response.data;
  
//       // בדיקה אם הנתונים הם בתבנית CSV
//       if (typeof data === 'string') {
//         // פרסום הנתונים כטקסט כדי להראות את המידע המתקבל
//         console.log(data);
  
//         // פירוק הנתונים לשורות
//         const rows = data.split('\n');
        
//         // החלקת הכותרת
//         const headers = rows[0].split(',');
  
//         // מציאת האינדקס של העמודה 'symbol'
//         const symbolIndex = headers.indexOf('symbol');
  
//         // אם העמודה לא נמצאה, הצגת הודעת שגיאה
//         if (symbolIndex === -1) {
//           throw new Error('Symbol column not found in the data');
//         }
  
//         // יצירת מערך של הסימבולים
//         const symbols = rows.slice(1).map(row => {
//           const columns = row.split(',');
//           return columns[symbolIndex];
//         }).filter(Boolean); // הסרת ערכים ריקים
  
//         console.log(symbols);
//         return symbols;
//       } else {
//         throw new Error('Unexpected data format received');
//       }
//     } catch (error) {
//       console.error('Error fetching stock symbols:', error.message);
//     }
//   }
//   fetchStockSymbols();