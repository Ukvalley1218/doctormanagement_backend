import Admin from "../../models/Admin.js";
import sendEmail from "../../utils/sendEmail.js";

// @desc Send OTP to admin email
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await admin.save();
    

    const message = `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`;

    await sendEmail(admin.email, "Admin Password Reset OTP", message);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Verify OTP and reset password
export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.otp !== otp || admin.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    admin.password = newPassword;
    admin.otp = undefined;
    admin.otpExpiry = undefined;

    await admin.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const resendOtp = async (req,res)=>{
   try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Email is required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "admin not found" });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    admin.isVerified = false;
    await admin.save();

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

};
