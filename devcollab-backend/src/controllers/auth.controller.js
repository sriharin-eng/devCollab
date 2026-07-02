import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import { generateOtp, sendOtpEmail } from "../services/email.service.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Register ──────────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    // Block if already verified
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // If unverified user exists, reuse it
    let user;
    if (existingUser && !existingUser.isVerified) {
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      existingUser.otpPurpose = "verify_email";
      if (password) existingUser.password = password;
      user = await existingUser.save();
    } else {
      user = await User.create({
        name,
        email,
        password,
        otp,
        otpExpiry,
        otpPurpose: "verify_email",
        isVerified: false,
      });
    }

    // Send email — if this fails, delete the newly created user so they can try again
    try {
      await sendOtpEmail(email, otp, "verify_email");
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
      // Only delete if we just created (not reused)
      if (!existingUser) await User.findByIdAndDelete(user._id);
      return res
        .status(500)
        .json({ message: "Failed to send OTP email. Please try again." });
    }

    res.status(201).json({
      message:
        "OTP sent to your email. Please verify to activate your account.",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Verify Email OTP ──────────────────────────────────────────────────────────
export const verifyEmailOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select(
      "+otp +otpExpiry +otpPurpose",
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Account already verified" });
    if (user.otpPurpose !== "verify_email")
      return res.status(400).json({ message: "Invalid OTP purpose" });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < new Date())
      return res
        .status(400)
        .json({ message: "OTP expired. Please register again." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({
      message: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Resend OTP ────────────────────────────────────────────────────────────────
export const resendOtp = async (req, res) => {
  try {
    const { userId, purpose } = req.body;
    const user = await User.findById(userId).select(
      "+otp +otpExpiry +otpPurpose",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = purpose || "verify_email";
    await user.save();

    await sendOtpEmail(user.email, otp, user.otpPurpose);
    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.password)
      return res
        .status(401)
        .json({ message: "This account uses Google sign-in" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      user.otpPurpose = "verify_email";
      await user.save();
      await sendOtpEmail(email, otp, "verify_email");
      return res.status(403).json({
        message: "Email not verified. A new OTP has been sent.",
        userId: user._id,
        requiresVerification: true,
      });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(200).json({
        message: "If that email is registered, you'll receive an OTP shortly.",
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = "reset_password";
    await user.save();

    await sendOtpEmail(email, otp, "reset_password");
    res.status(200).json({
      message: "If that email is registered, you'll receive an OTP shortly.",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId).select(
      "+otp +otpExpiry +otpPurpose",
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otpPurpose !== "reset_password")
      return res.status(400).json({ message: "Invalid OTP purpose" });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < new Date())
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    if (!newPassword || newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Google OAuth ──────────────────────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true;
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || "",
        isVerified: true,
      });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      message: "Google sign-in successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// ── Test Email (remove after testing) ────────────────────────────────────────
export const testEmail = async (req, res) => {
  try {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "loaded" : "MISSING");
    await sendOtpEmail(process.env.EMAIL_USER, "123456", "verify_email");
    res.status(200).json({ message: "Email sent!" });
  } catch (err) {
    console.error("Full error:", err);
    res.status(500).json({ message: err.message, code: err.code });
  }
};

// ── Get Me ────────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  const u = req.user;
  res.status(200).json({
    user: { id: u._id, name: u.name, email: u.email, avatar: u.avatar },
  });
};
