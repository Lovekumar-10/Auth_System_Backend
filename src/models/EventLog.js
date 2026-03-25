// models/EventLog.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true 
  }, 
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  email: String, 
  ip: String,
  message: String, 
  createdAt: { 
    type: Date, 
    default: Date.now,
    
    expires: 60 * 24 * 60 * 60 // 60 days in seconds
  },
});

module.exports = mongoose.model("EventLog", logSchema);