// sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_HOST,
      port: process.env.BREVO_PORT,
      secure: process.env.BREVO_PORT == 465, // SSL if 465
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.BREVO_USER}>`,
      to,
      subject,
      text,
    });

    console.log("📨 Email sent via Brevo:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Failed to send email via Brevo", err);
    throw err;
  }
};

export default sendEmail;
