const mongoose = require("mongoose");

require("dotenv").config(); 

const connectDB = async () => {
  try {
    // This looks for MONGO_URI in your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;