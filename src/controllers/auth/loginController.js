
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const User = require("../../models/User");
const UserSession = require("../../models/UserSession");
const asyncHandler = require("../../middleware/handlers/asyncHandler");
const eventWrapper = require("../../middleware/handlers/eventWrapper");
const { EVENTS } = require("../../utils/constants");

const PEPPER = process.env.PEPPER || "";
const MAX_SESSIONS = 5;

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 400;
    error.logType = EVENTS.LOGIN_FAILED;
    throw error;
  }


  if (!user.isVerified) {
    const error = new Error("Please verify your email before logging in");
    error.statusCode = 403;
    error.logType = EVENTS.LOGIN_FAILED;
    throw error;
  }


  const isMatch = await bcrypt.compare(password + PEPPER, user.password);
  if (!isMatch) {
    const legacyMatch = await bcrypt.compare(password, user.password);
    if (!legacyMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 400;
      error.logType = EVENTS.LOGIN_FAILED;
      throw error;
    }
  }


  const jti = uuidv4();


  const accessToken = jwt.sign(
    { id: user._id,
      role: user.role ,
      jti: jti
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, jti },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");


  const sessions = await UserSession.find({ userId: user._id }).sort({ createdAt: 1 });

  if (sessions.length >= MAX_SESSIONS) {
    await UserSession.deleteOne({ _id: sessions[0]._id }); // delete oldest
  }


  const device = req.headers["user-agent"] || "Unknown Device";
  const ip = req.ip;

  await UserSession.create({
    userId: user._id,
    refreshToken: hashedRefreshToken,
    jti,
    device,
    ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  console.log(`✅ [LOGIN] ${user.email} logged in from ${device}`);


  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

 
  return res.status(200).json({
    message: "You have logged in successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    
  });
};

module.exports = eventWrapper(EVENTS.LOGIN_SUCCESS)(
  asyncHandler(loginUser)
);