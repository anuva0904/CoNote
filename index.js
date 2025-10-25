//Global modules
const express =require('express');
const mongoose=require('mongoose');
require('dotenv').config();
const app=express();





//Local modules
const db=require('./config/dbconnection');
db();


app.get('/',(req,res)=>{
    res.send('Hello World');
})

const port=process.env.PORT;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})