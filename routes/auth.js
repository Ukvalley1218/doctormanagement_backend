import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

import { registerSchema, loginSchema } from "../validations/userValidation.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// ===================== LOGIN (Send OTP) =====================
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Email is required" });

    let user = await User.findOne({ email });

    // If new user, create automatically
    if (!user) {
      user = new User({ email });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min expiry
    user.isVerified = false;

    await user.save();

    // Send OTP email
    await sendEmail(
      email,
      "Your OTP for Login",
      `Your OTP is ${otp}. It expires in 10 minutes.`
    );

    res.json({ msg: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ===================== VERIFY OTP =====================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
console.log(email,otp)
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      msg: "Login successful",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ===================== RESEND OTP =====================
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.isVerified = false;
    await user.save();

    // Send OTP again
    await sendEmail(
      email,
      "Your OTP (Resent)",
      `Your new OTP is ${otp}. It expires in 10 minutes.`
    );

    res.json({ msg: "New OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});



// ===================== REGISTER WITH OTP =====================
// router.post("/register", validate(registerSchema), async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ msg: "User already exists, try with another email" });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

//     // Save user with OTP
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       otp,
//       otpExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
//     });
//     await newUser.save();

//     // Send OTP email
//     await sendEmail(
//       email,
//       "Verify your account",
//       `Your OTP is ${otp}. It expires in 10 minutes.`
//     );

//     res.status(201).json({ msg: "OTP sent to your email. Please verify." });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// });

export default router;
