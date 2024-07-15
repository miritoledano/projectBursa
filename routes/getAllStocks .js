const express =require( "express");
const {getStocks}=require('../API/getStocks');
const router = express.Router();
router.get("/", getStocks);
module.exports={router};




