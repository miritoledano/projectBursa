const express =require( "express");
const {getByName}=require('../API/getByName');
const router = express.Router();
router.get("/:symbol", getByName);
module.exports={router};




