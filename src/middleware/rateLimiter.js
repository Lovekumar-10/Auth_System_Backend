// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

// Helper to format time in minutes
const formatMinutes = (ms) => Math.ceil(ms / 60000);

// Global limiter (applies to all routes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                 // max 200 requests per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: (req, res) => {
    return {
      message: `Too many requests from this IP. Please try again after ${formatMinutes(15 * 60 * 1000)} minutes.`,
    };
  },
});

// Auth limiter (sensitive routes like login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // max 5 attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: (req, res) => {
    return {
      message: `Too many authentication attempts. Please wait ${formatMinutes(15 * 60 * 1000)} minutes before trying again.`,
    };
  },
});

module.exports = { globalLimiter, authLimiter };