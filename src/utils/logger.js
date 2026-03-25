// utils/logger.js
const EventLog = require("../models/EventLog");

/**
 * Log an event to the database
 * @param {Object} params
 * @param {string} params.type - Event type (LOGIN_SUCCESS, REGISTER_FAILED, etc.)
 * @param {string} [params.userId] - MongoDB User ID
 * @param {string} [params.email] - User email
 * @param {string} [params.message] - Message to store
 * @param {Object} [params.req] - Express request object (optional, for IP)
 */
async function logger({ type, userId, email, message, req }) {
  try {
    // Get IP address from request if available
    const ip = req
      ? req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress
      : undefined;

    // Save event to DB
    await EventLog.create({
      type,
      userId,
      email,
      ip,
      message,
    });
  } catch (error) {
    console.error("Failed to log event:", error);
  }
}

module.exports = logger;