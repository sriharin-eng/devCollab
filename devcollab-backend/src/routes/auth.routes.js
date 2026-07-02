import express from "express";
import {
  registerUser,
  verifyEmailOtp,
  resendOtp,
  loginUser,
  forgotPassword,
  resetPassword,
  googleAuth,
  getMe,
} from "../controllers/auth.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmailOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", googleAuth);
router.get("/me", protect, getMe);
export default router;
