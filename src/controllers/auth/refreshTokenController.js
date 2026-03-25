








const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const User = require("../../models/User");
const UserSession = require("../../models/UserSession");

const refreshTokenController = async (req, res) => {
  const token = req.cookies.refreshToken;

 
  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  let decoded;


  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const session = await UserSession.findOne({
    refreshToken: hashedToken,
    jti: decoded.jti,
    userId: decoded.id,
  });


  if (!session) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }


  if (session.expiresAt < new Date()) {
    await UserSession.deleteOne({ _id: session._id });
    return res.status(403).json({ message: "Refresh token expired" });
  }

 
  const user = await User.findById(session.userId);

  if (!user) {
    await UserSession.deleteOne({ _id: session._id });
    return res.status(403).json({ message: "User not found" });
  }

 

 
  await UserSession.deleteOne({ _id: session._id });

  const newJti = uuidv4();


  const newAccessToken = jwt.sign(
    // { id: user._id, role: user.role },
    { id: user._id, role: user.role, jti: newJti },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const newRefreshToken = jwt.sign(
    { id: user._id, jti: newJti },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );


  const newHashedToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");


  await UserSession.create({
    userId: user._id,
    refreshToken: newHashedToken,
    jti: newJti,
    device: session.device,
    ip: session.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });


  res.cookie("token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    message: "Access token refreshed",
  });
};

module.exports = refreshTokenController;











