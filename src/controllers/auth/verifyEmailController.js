


const crypto = require("crypto");
const User = require("../../models/User");
const asyncHandler = require("../../middleware/handlers/asyncHandler");
const eventWrapper = require("../../middleware/handlers/eventWrapper");
const { EVENTS } = require("../../utils/constants");

const verifyEmail = async (req, res) => {
  const token = req.params.token;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    const err = new Error("Token invalid or expired");
    err.statusCode = 400;
    err.logMessage = `Invalid or expired token: ${token}`;
    err.email = "Unknown or invalid";
    throw err;
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    message: "Email verified successfully",
    logMessage: "User email verified successfully",
    userId: user._id,
    email: user.email,
  });
};

// Wrap with asyncHandler + eventWrapper
module.exports = eventWrapper(EVENTS.EMAIL_VERIFIED)(
  asyncHandler(verifyEmail)
);