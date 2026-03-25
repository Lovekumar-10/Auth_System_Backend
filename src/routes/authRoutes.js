




const express = require("express");
const router = express.Router();

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
const { requestPasswordReset, resetPassword, } = require("../controllers/auth/passwordResetController");
const changePassword = require("../controllers/auth/changePasswordController");
const resendVerificationEmail = require("../controllers/auth/resendVerificationEmailController");
const getMeController = require("../controllers/auth/getMeController");

const User = require("../models/User");

// =========================
// Public Routes
// =========================

// 1. Forgot Password - Email submit karne ke liye
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  requestPasswordReset // Pehle yeh function chalega
);





router.post(
  "/reset-password/:token", 
  authLimiter,
  resetPasswordValidation,
  resetPassword 
);

router.post("/register", authLimiter, registerValidation, registerUser);
router.post("/login", authLimiter, loginValidation, loginUser);

router.post("/refresh-token", refreshToken);


router.get("/check-verification", authLimiter, checkVerification);
router.get("/verify-email/:token", authLimiter, verifyEmail);
router.post("/resend-verification", resendLimiter, resendVerificationEmail);

// =========================
// Protected Routes
// =========================
// routes/authRoutes.js

router.post("/logout-all", protect, logoutAllDevices);
router.post("/logout", protect, logoutUser);
router.post("/change-password", protect, changePassword);



router.get("/me", protect, getMeController);


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
  }
);

module.exports = router;