const express =require( "express");
const {getAllStocks }=require('../API/getStocks');
const router = express.Router();
router.get("/", getAllStocks );
module.exports = router;




