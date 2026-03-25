

const logger = require("../../utils/logger");
const { EVENTS } = require("../../utils/constants"); 
const errorHandler = async (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log the error centrally
  await logger({
    type: EVENTS?.ERROR || "ERROR",
    message,
    userId: req.user?._id || null,
    email: req.user?.email || req.body?.email || "Unknown",
    req,
  });

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
