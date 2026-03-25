// const crypto = require("crypto");
// const User = require("../../models/User");
// const sendEmail = require("../../utils/email");
// const verifyEmailTemplate = require("../../utils/emailTemplates/verifyEmailTemplate");
// const logEvent = require("../../utils/logger"); // added for monitoring/logs

// // Resend Verification Email
// const resendVerificationEmail = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({ message: "Email already verified" });
//     }

//     // Generate a new verification token
//     const verificationToken = crypto.randomBytes(32).toString("hex");

//     // Save hashed token in user document
//     user.emailVerificationToken = crypto
//       .createHash("sha256")
//       .update(verificationToken)
//       .digest("hex");
//     user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

//     await user.save({ validateBeforeSave: false });

//     // Create verification link
//     const verifyURL = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${verificationToken}`;

//     // Prepare email template
//     const html = verifyEmailTemplate(user.name, verifyURL);

//     await sendEmail({
//       to: user.email,
//       subject: "Verify Your Email",
//       html,
//     });

//     // Log resend verification event
//     await logEvent({
//       type: "RESEND_VERIFICATION_EMAIL",
//       userId: user._id,
//       email: user.email,
//        req, // just pass the request object
//       message: "Verification email resent",
//     });

//     res.status(200).json({
//       message: "Verification email sent again",
//     });
//   } catch (error) {
//     console.error("Resend Verification Error:", error);

//     await logEvent({
//       type: "RESEND_VERIFICATION_ERROR",
//       email: req.body.email || "Unknown",
//        req, // just pass the request object
//       message: `Server error while resending verification: ${error.message}`,
//     });

//     res.status(500).json({ message: "Server Error" });
//   }
// };

// module.exports = resendVerificationEmail;




const crypto = require("crypto");
const User = require("../../models/User");
const sendEmail = require("../../utils/email");
const verifyEmailTemplate = require("../../utils/emailTemplates/verifyEmailTemplate");
const asyncHandler = require("../../middleware/handlers/asyncHandler");
const eventWrapper = require("../../middleware/handlers/eventWrapper");
const { EVENTS } = require("../../utils/constants");

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    err.logMessage = "Resend verification attempt for non-existing user";
    err.email = email;
    throw err;
  }

  if (user.isVerified) {
    const err = new Error("Email already verified");
    err.statusCode = 400;
    err.logMessage = "Attempted to resend verification for already verified user";
    err.userId = user._id;
    err.email = user.email;
    throw err;
  }

  // Generate a new verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Save hashed token
  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

  await user.save({ validateBeforeSave: false });

  // Create verification link & email template
  // const verifyURL = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${verificationToken}`;
  
  const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  const html = verifyEmailTemplate(user.name, verifyURL);

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html,
  });

  return res.status(200).json({
    message: "Verification email sent again",
    logMessage: "Verification email resent",
    userId: user._id,
    email: user.email,
  });
};

// Wrap with asyncHandler + eventWrapper
module.exports = eventWrapper(EVENTS.RESEND_VERIFICATION_EMAIL)(
  asyncHandler(resendVerificationEmail)
);