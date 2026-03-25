// middleware/resendLimiter.js
const rateLimit = require("express-rate-limit");

// Limit resending verification emails per user (email) to 3 per hour
const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,                    // max 3 resends per user per hour
  keyGenerator: (req) => req.body.email, // limit per email, not IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many verification email requests for this account. Please try again later."
  },
});

module.exports = { resendLimiter };