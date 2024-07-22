const express = require('express');
const router = express.Router();
const {getStocksByDate}=require('../API/getStocksByDate');
router.get("/:date", getStocksByDate);

module.exports = router;
