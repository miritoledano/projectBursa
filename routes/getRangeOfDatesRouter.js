const express = require('express');
const { getRangeOfDates } = require('../API/getRangeOfDates');
const router = express.Router();

router.get("/:startDate/:endDate", getRangeOfDates);

module.exports = router;
