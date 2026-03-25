// controllers/auth/changePasswordController.js
const bcrypt = require("bcrypt");
const User = require("../../models/User");
const UserSession = require("../../models/UserSession");

const validatePassword = require("../../utils/passwordValidator");
const asyncHandler = require("../../middleware/handlers/asyncHandler");
const eventWrapper = require("../../middleware/handlers/eventWrapper");
const { EVENTS } = require("../../utils/constants");

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // const isMatch = await bcrypt.compare(oldPassword, user.password);
  const isMatch = await bcrypt.compare(oldPassword + PEPPER, user.password);
  if (!isMatch) {
    const error = new Error("Old password incorrect");
    error.statusCode = 400;
    error.logType = EVENTS.PASSWORD_CHANGED + "_FAILED";
    throw error;
  }

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) {
    const error = new Error(passwordCheck.message);
    error.statusCode = 400;
    error.logType = EVENTS.PASSWORD_CHANGED + "_FAILED";
    throw error;
  }

  // user.password = await bcrypt.hash(newPassword, 10);
  user.password = await bcrypt.hash(newPassword + PEPPER, 10);
  await user.save();


  user.passwordChangedAt = new Date();

  // after saving new password
  await UserSession.deleteMany({
    userId: user._id,
  });

  // Return response + optional log message for eventWrapper
  return res.status(200).json({
    message: "Password changed successfully",
    logMessage: "Password changed successfully",
  });
};

// Wrap with asyncHandler + eventWrapper
module.exports = eventWrapper(EVENTS.PASSWORD_CHANGED)(
  asyncHandler(changePassword),
);
