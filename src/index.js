//require('dotenv').config({path:'./env'});   
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({path:"./env"});

connectDB()
.then( () => {
     app.listen(process.env.PORT || 8000, () => {
        console.log(`Server start at port : ${process.env.PORT}`);
     })
})
.catch((err) => {
    console.log("error",err);
    throw err;
})



















/*
import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "./constants";

const app = express();

;(async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        //.on -> el listener h 
        app.on("error",(error)=>{
            console.log("Error ",error);
            throw error;
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server connect at ,${process.env.PORT}`  );
        })
    } catch (error) {
        console.log("Mongodb connection error ",error);
        throw error;
    }
})();
*/