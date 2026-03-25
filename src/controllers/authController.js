// const bcrypt = require("bcrypt");
// const crypto = require("crypto");
// const jwt = require("jsonwebtoken");

// const User = require("../models/User");

// const validatePassword = require("../utils/passwordValidator");
// const sendEmail = require("../utils/email");

// const verifyEmailTemplate = require("../utils/emailTemplates/verifyEmailTemplate");
// const resetPasswordTemplate = require("../utils/emailTemplates/resetPasswordTemplate");
// const otpTemplate = require("../utils/emailTemplates/otpTemplate");

// const generateOTP = require("../utils/generateOTP");



// // 🔹 Register User
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const passwordCheck = validatePassword(password);
//     if (!passwordCheck.valid) {
//       return res.status(400).json({
//         message: passwordCheck.message,
//         suggestions: passwordCheck.suggestions || [],
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: role || "user",
//     });

//     // generate token
//     const verificationToken = crypto.randomBytes(32).toString("hex");

//     // store hashed token
//     user.emailVerificationToken = crypto
//       .createHash("sha256")
//       .update(verificationToken)
//       .digest("hex");

//     user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

//     await user.save({ validateBeforeSave: false });

//     // verification link
//     const verifyURL = `${req.protocol}://${req.get("host")}/api/users/verify-email/${verificationToken}`;

//     console.log("VERIFY URL:", verifyURL); // debug

//     const html = verifyEmailTemplate(user.name, verifyURL);

//     await sendEmail({
//       to: user.email,
//       subject: "Verify Your Email",
//       html,
//     });

//     res.status(201).json({
//       message: "User registered successfully. Verification email sent.",
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });

//   } catch (error) {
//     console.error("Register Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };




// // 🔹 Verify Email
// const verifyEmail = async (req, res) => {
//   try {

//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(req.params.token)
//       .digest("hex");

//     const user = await User.findOne({
//       emailVerificationToken: hashedToken,
//       emailVerificationExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Token invalid or expired" });
//     }

//     user.isVerified = true;
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;

//     await user.save({ validateBeforeSave: false });

//     res.status(200).json({
//       message: "Email verified successfully",
//     });

//   } catch (error) {
//     console.error("Verify Email Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


// // 🔹 Send OTP
// const sendEmailOTP = async (req, res) => {
//   try {

//     const { email } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({ message: "Email already verified" });
//     }

//     const otp = generateOTP();

//     user.emailOTP = otp;
//     user.emailOTPExpires = Date.now() + 10 * 60 * 1000;

//     await user.save({ validateBeforeSave: false });

//     const html = otpTemplate(user.name, otp);

//     await sendEmail({
//       to: user.email,
//       subject: "Email Verification OTP",
//       html,
//     });

//     res.status(200).json({
//       message: "OTP sent successfully",
//     });

//   } catch (error) {
//     console.error("OTP Send Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


// // 🔹 Verify OTP
// const verifyEmailOTP = async (req, res) => {
//   try {

//     const { email, otp } = req.body;

//     const user = await User.findOne({
//       email,
//       emailOTP: otp,
//       emailOTPExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     user.isVerified = true;
//     user.emailOTP = undefined;
//     user.emailOTPExpires = undefined;

//     await user.save({ validateBeforeSave: false });

//     res.status(200).json({
//       message: "Email verified successfully using OTP",
//     });

//   } catch (error) {
//     console.error("OTP Verify Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


// // 🔹 Resend Verification Email
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

//     const verificationToken = crypto.randomBytes(32).toString("hex");

//     user.emailVerificationToken = crypto
//       .createHash("sha256")
//       .update(verificationToken)
//       .digest("hex");

//     user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

//     await user.save({ validateBeforeSave: false });

//     const verifyURL = `${req.protocol}://${req.get("host")}/api/users/verify-email/${verificationToken}`;

//     const html = verifyEmailTemplate(user.name, verifyURL);

//     await sendEmail({
//       to: user.email,
//       subject: "Verify Your Email",
//       html,
//     });

//     res.status(200).json({
//       message: "Verification email sent again",
//     });

//   } catch (error) {
//     console.error("Resend Verification Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


// // 🔹 Login
// const loginUser = async (req, res) => {
//   try {

//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     if (!user.isVerified) {
//       return res.status(403).json({
//         message: "Please verify your email before logging in",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "Strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });

//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


// // 🔹 Logout
// const logoutUser = async (req, res) => {
//   res.clearCookie("token");
//   res.status(200).json({ message: "Logout successful" });
// };


// // 🔹 Request Password Reset
// const requestPasswordReset = async (req, res) => {
//   try {

//     const { email } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(200).json({
//         message: "If your email exists, reset instructions have been sent",
//       });
//     }

//     const resetToken = crypto.randomBytes(32).toString("hex");

//     user.passwordResetToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

//     await user.save({ validateBeforeSave: false });

//     const resetURL = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

//     const html = resetPasswordTemplate(resetURL);

//     await sendEmail({
//       to: user.email,
//       subject: "Password Reset",
//       html,
//     });

//     res.status(200).json({
//       message: "Password reset instructions sent",
//     });

//   } catch (error) {
//     console.error("Request Password Reset Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


// // 🔹 Reset Password
// const resetPassword = async (req, res) => {
//   try {

//     const { token, newPassword } = req.body;

//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     const user = await User.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     const passwordCheck = validatePassword(newPassword);

//     if (!passwordCheck.valid) {
//       return res.status(400).json({ message: passwordCheck.message });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);

//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;

//     await user.save();

//     res.status(200).json({
//       message: "Password reset successfully",
//     });

//   } catch (error) {
//     console.error("Reset Password Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


// // 🔹 Change Password
// const changePassword = async (req, res) => {
//   try {

//     const { oldPassword, newPassword } = req.body;

//     const user = await User.findById(req.user.id);

//     const isMatch = await bcrypt.compare(oldPassword, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Old password incorrect" });
//     }

//     const passwordCheck = validatePassword(newPassword);

//     if (!passwordCheck.valid) {
//       return res.status(400).json({ message: passwordCheck.message });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);

//     await user.save();

//     res.status(200).json({
//       message: "Password changed successfully",
//     });

//   } catch (error) {
//     console.error("Change Password Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


// module.exports = {
//   registerUser,
//   verifyEmail,
//   sendEmailOTP,
//   verifyEmailOTP,
//   resendVerificationEmail,
//   loginUser,
//   logoutUser,
//   requestPasswordReset,
//   resetPassword,
//   changePassword,
// };


