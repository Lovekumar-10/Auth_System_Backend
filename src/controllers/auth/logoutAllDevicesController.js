const asyncHandler = require("../../middleware/handlers/asyncHandler");
const eventWrapper = require("../../middleware/handlers/eventWrapper");
const { EVENTS } = require("../../utils/constants");
const UserSession = require("../../models/UserSession");

const logoutAllDevices = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // ✅ Delete ALL sessions of this user
  const result = await UserSession.deleteMany({
    userId: req.user._id,
  });

  console.log(`🔥 [LOGOUT ALL] ${req.user.email} logged out from all devices`);

  // ✅ Clear cookies (current device)
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    message: "Logged out from all devices",
    sessionsCleared: result.deletedCount,
  });
};

module.exports = eventWrapper(EVENTS.LOGOUT)(asyncHandler(logoutAllDevices));
