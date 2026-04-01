const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/handlers/asyncHandler");
const User = require("../models/User");
const checkPendingDeletion = require("../middleware/checkPendingDeletion");

const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");


// Validators
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validators/authValidator");

const { resendLimiter } = require("../middleware/resendLimiter");
const { authLimiter } = require("../middleware/rateLimiter");

const refreshToken = require("../controllers/auth/refreshTokenController");

// Modular controllers
const registerUser = require("../controllers/auth/registerController");
const verifyEmail = require("../controllers/auth/verifyEmailController");
const loginUser = require("../controllers/auth/loginController");
const logoutUser = require("../controllers/auth/logoutController");

const logoutAllDevices = require("../controllers/auth/logoutAllDevicesController");

const checkVerification = require("../controllers/auth/checkVerificationController");
const {
  requestPasswordReset,
  resetPassword,
} = require("../controllers/auth/passwordResetController");
const changePassword = require("../controllers/auth/changePasswordController");
const resendVerificationEmail = require("../controllers/auth/resendVerificationEmailController");
const getMeController = require("../controllers/auth/getMeController");



// =========================
// Public Routes
// =========================

// 1. Forgot Password - Email submit karne ke liye
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  requestPasswordReset, // Pehle yeh function chalega
);

router.post(
  "/reset-password/:token",
  authLimiter,
  resetPasswordValidation,
  resetPassword,
);

router.post("/register", authLimiter, registerValidation, registerUser);
router.post("/login", authLimiter, loginValidation, loginUser);

router.post("/refresh-token", refreshToken);

// router.get("/check-verification", authLimiter, checkVerification);
router.get("/check-verification",  checkVerification);
// router.get("/verify-email/:token", authLimiter, verifyEmail);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendLimiter, resendVerificationEmail);

// =========================
// Protected Routes
// =========================
// routes/authRoutes.js


router.post("/logout-all", protect, checkPendingDeletion, logoutAllDevices);

router.post("/logout", protect, checkPendingDeletion, logoutUser);
router.post("/change-password", protect, checkPendingDeletion, changePassword);
router.get("/me", protect, checkPendingDeletion, getMeController);



router.post(
  "/delete-account",
  protect,
  checkPendingDeletion,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.pendingDeletion) {
      return res
        .status(400)
        .json({ message: "Account deletion already requested" });
    }

    user.pendingDeletion = true;
    user.deletionRequestedAt = new Date();

    await user.save();
    return res.status(200).json({
      message:
        "Account deletion requested. You have 15 days to undo this action.",
    });
  })
);

// Cancel Deletion / Recover Account
router.post(
  "/cancel-deletion",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If not in deletion mode
    if (!user.pendingDeletion) {
      return res.status(400).json({
        message: "Your account is not scheduled for deletion",
      });
    }

    // ✅ Reset deletion state
    user.pendingDeletion = false;
    user.deletionRequestedAt = null;

    await user.save();

    return res.status(200).json({
      message: "Account recovery successful. Deletion cancelled.",
      success: true,
    });
  })
);





// =========================
// Admin Routes
// =========================



router.delete(
  "/delete-user/:id",
  protect,
  roleCheck(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json({
        message: `User ${req.params.id} deleted by admin`,
      });
    } catch (err) {
      console.error("Delete User Error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

module.exports = router;
