


const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../../models/User");
const validatePassword = require("../../utils/passwordValidator");
const sendEmail = require("../../utils/email");
const verifyEmailTemplate = require("../../utils/emailTemplates/verifyEmailTemplate");

const asyncHandler = require("../../middleware/handlers/asyncHandler");
const eventWrapper = require("../../middleware/handlers/eventWrapper");

const { EVENTS } = require("../../utils/constants");


const PEPPER = process.env.PEPPER; // NEW


const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    const err = new Error("User already exists");
    err.statusCode = 400;
    err.logMessage = "Attempted to register with existing email";
    err.email = email;
    throw err; 
  }

  // validate password
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    const err = new Error(passwordCheck.message);
    err.statusCode = 400;
    err.logMessage = `Password validation failed: ${passwordCheck.message}`;
    err.email = email;
    throw err;
  }

  // hash password  + added extra layer with PEPPER
  const hashedPassword = await bcrypt.hash(password + PEPPER, 10);

  
  // create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user",
  });

  // generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

  await user.save({ validateBeforeSave: false });

  // send verification email
  // const verifyURL = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${verificationToken}`;
  
  const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const html = verifyEmailTemplate(user.name, verifyURL);

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html,
  });

  return res.status(201).json({
    message: "User registered successfully. Verification email sent.",
    logMessage: "User registered successfully",
    userId: user._id,
    email: user.email,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// Wrap with asyncHandler + eventWrapper
module.exports = eventWrapper(EVENTS.REGISTER_SUCCESS)(asyncHandler(registerUser));