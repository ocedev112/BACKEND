const mongoose = require("mongoose")
require("dotenv").config({path: "../config.env"})

const Db = process.env.ATLAS_URI;

const connectDB = async () => {
    try{
        await mongoose.connect(Db)
        console.log("MongoDB connected")
    }
    catch(error){
        console.error(error)
    }
}

connectDB()