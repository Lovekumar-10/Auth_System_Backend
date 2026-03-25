const User = require("../../models/User");
const asyncHandler = require("../../middleware/handlers/asyncHandler");

const checkVerification = async (req, res) => {
  const { email } = req.query;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ verified: false });
  }

  return res.status(200).json({
    verified: user.isVerified,
  });
};

module.exports = asyncHandler(checkVerification);