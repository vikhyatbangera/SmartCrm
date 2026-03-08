import nodemailer from "nodemailer";

export const sendQuotationEmail = async ({ to, subject, html, attachments }) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Email credentials not configured in .env file");
      throw new Error("Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CRM System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    };

    console.log("📧 Sending email to:", to);
    console.log("📝 Subject:", subject);
    console.log("📎 Attachments:", attachments?.length || 0);

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    console.error("Error details:", error);
    throw error;
  }
};