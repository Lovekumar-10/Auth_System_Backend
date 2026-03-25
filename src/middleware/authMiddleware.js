
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserSession = require("../models/UserSession");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Access token expired",
        });
      }

      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const session = await UserSession.findOne({
      userId: decoded.id,
      jti: decoded.jti,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // ✅ ADD THIS BLOCK
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10,
      );

      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          message: "Password recently changed. Please login again.",
        });
      }
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Protect Middleware Error:", error);

    return res.status(500).json({
      message: "Server error in auth middleware",
    });
  }
};

module.exports = { protect };
