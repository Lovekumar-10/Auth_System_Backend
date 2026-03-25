

const asyncHandler = require("../../middleware/handlers/asyncHandler");
const eventWrapper = require("../../middleware/handlers/eventWrapper");
const { EVENTS } = require("../../utils/constants");
const UserSession = require("../../models/UserSession");

const crypto = require("crypto");

const logoutUser = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (refreshToken) {
   
    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const deleted = await UserSession.deleteOne({
      refreshToken: hashedRefreshToken,
    });

    if (deleted.deletedCount > 0) {
      console.log(` [LOGOUT] ${req.user.email} logged out`);
    } else {
      console.log(`[LOGOUT] No session found`);
    }
  }

 
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production"
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production"
  });

  return res.status(200).json({
    message: "Logout successful",
  });
};

module.exports = eventWrapper(EVENTS.LOGOUT)(asyncHandler(logoutUser));