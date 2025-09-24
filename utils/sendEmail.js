// sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.ZEPTO_HOST, // smtp.zeptomail.com
      port: process.env.ZEPTO_PORT, // 465 or 587
      secure: process.env.ZEPTO_PORT == 465, // true for 465 (SSL), false for 587 (TLS)
      auth: {
        user: process.env.ZEPTO_USER, // ZeptoMail SMTP username
        pass: process.env.ZEPTO_PASS, // ZeptoMail SMTP password
      },
    });

    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.ZEPTO_USER}>`, // must be verified domain
      to,
      subject,
      text,
    });

    console.log("📨 Email sent via ZeptoMail successfully!");
    return info;
  } catch (error) {
    console.error("❌ Failed to send email via ZeptoMail", error);
    throw error;
  }
};

export default sendEmail;
