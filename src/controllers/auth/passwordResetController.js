const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../../models/User");
const sendEmail = require("../../utils/email");
const UserSession = require("../../models/UserSession");
const resetPasswordTemplate = require("../../utils/emailTemplates/resetPasswordTemplate");
const validatePassword = require("../../utils/passwordValidator");
const asyncHandler = require("../../middleware/handlers/asyncHandler");
const eventWrapper = require("../../middleware/handlers/eventWrapper");
const { EVENTS } = require("../../utils/constants");

const PEPPER = process.env.PEPPER;
// --- 1. REQUEST PASSWORD RESET ---
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    const err = new Error("Please provide your registered email address");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email });

  if (!user) {
    const err = new Error(
      "This email is not registered. Please enter your registered email.",
    );
    err.statusCode = 404;
    throw err;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 10 minute expiration
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // FIXED ROUTE
  // const resetURL = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    const html = resetPasswordTemplate(resetURL);

    await sendEmail({
      to: user.email,
      subject: "Password Reset Link (Expires in 10 Minutes)",
      html,
    });

    res.status(200).json({
      success: true,
      message:
        "A reset link has been sent to your registered email. Valid for 10 minutes.",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    const err = new Error("Email delivery failed. Please try again.");
    err.statusCode = 500;
    throw err;
  }
};

// --- 2. RESET PASSWORD ---
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    const err = new Error("Both password fields are required.");
    err.statusCode = 400;
    throw err;
  }

  if (newPassword !== confirmPassword) {
    const err = new Error("Passwords do not match. Please re-type.");
    err.statusCode = 400;
    throw err;
  }

  const passwordCheck = validatePassword(newPassword);

  if (!passwordCheck.valid) {
    const err = new Error(passwordCheck.message);
    err.statusCode = 400;
    err.suggestions = passwordCheck.suggestions || [];
    throw err;
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    const err = new Error(
      "The link is invalid or has expired (10 min limit exceeded).",
    );
    err.statusCode = 400;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword + PEPPER, 10);


  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  user.passwordChangedAt = new Date();

  await UserSession.deleteMany({
    userId: user._id,
  });

  res.status(200).json({
    success: true,
    message: "Your password has been successfully changed!",

  });
};

module.exports = {
  requestPasswordReset: eventWrapper(EVENTS.PASSWORD_RESET_REQUEST)(
    asyncHandler(requestPasswordReset),
  ),

  resetPassword: eventWrapper(EVENTS.PASSWORD_RESET_SUCCESS)(
    asyncHandler(resetPassword),
  ),
};
