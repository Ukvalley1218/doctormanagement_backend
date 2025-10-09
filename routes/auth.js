import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

import { registerSchema, loginSchema } from "../validations/userValidation.js";
import validate from "../middleware/validate.js";
import { console } from "inspector";

const router = express.Router();

// ===================== LOGIN (Send OTP) =====================
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    let user = await User.findOne({ email });
    if (!user) user = new User({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    user.isVerified = false;
    await user.save();

    // Send OTP via Brevo
   await sendEmail(
  email,
  "Your Healcure Login OTP",
  `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #f9fafb; text-align: center; padding: 20px;">
      <img src="https://healcure.ca/assets/logo-Bwud1c4U.png" alt="Healcure" style="width: 120px; margin-bottom: 10px;" />
      <h2 style="color: #333;">Login Verification</h2>
    </div>

    <div style="padding: 20px; color: #333;">
      <p>Dear User,</p>
      <p>Thank you for choosing <strong>Healcure</strong>. Please use the following One-Time Password (OTP) to complete your login:</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <span style="font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #1E88E5;">${otp}</span>
      </div>
      
      <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
      <p>If you didn’t request this, please ignore this email or contact our support team immediately.</p>
      
      <p style="margin-top: 30px;">Best regards,<br /><strong>The Healcure Team</strong></p>
    </div>

    <div style="background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #666;">
      <p>© ${new Date().getFullYear()} Healcure. All rights reserved.</p>
    </div>
  </div>
  `
);


    res.json({ msg: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});



// ===================== VERIFY OTP =====================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email, otp);
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

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
