import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// send email to user
const sendEmail = async (to, subject, text) => {
  console.log("📧 Preparing to send email...");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Text:", text);

  try {
    // create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("✅ Transporter created successfully");

    // verify transporter connection (optional but useful for debugging)
    await transporter.verify();
    console.log("✅ Transporter verified successfully");

    // send mail
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log("📨 Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info) || "N/A");

    return info;
  } catch (error) {
    console.error("❌ Failed to send email");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    throw error; // rethrow so caller can handle it
  }
};

export default sendEmail;
