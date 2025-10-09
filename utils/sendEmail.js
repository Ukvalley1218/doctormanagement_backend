import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

   const info = await transporter.sendMail({
      from: '"Healcure" <no-reply@healcure.ca>',
      to,
      subject,
      html: htmlContent, // ✅ explicitly HTML content
    });
    console.log("📨 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};

export default sendEmail;
