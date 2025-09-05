import express from "express";
import { sendOtp,verifyOtpAndResetPassword } from "../../controller/admin/adminOtpController.js";

const router = express.Router();

// send otp 
router.post('/send-otp',sendOtp);

// verify otp and reset password 
router.post('/reset-password',verifyOtpAndResetPassword);

export default router;