import express from "express";
import { sendOtp,verifyOtpAndResetPassword,resendOtp } from "../../controller/admin/adminOtpController.js";

const router = express.Router();

// send otp 
router.post('/send-otp',sendOtp);

// verify otp and reset password 
router.post('/reset-password',verifyOtpAndResetPassword);

// resend otp 
router.post('/resend-otp',resendOtp);

export default router;