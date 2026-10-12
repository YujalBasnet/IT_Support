
import "dotenv/config";
console.log("SMTP configuration check:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  passwordLoaded: Boolean(process.env.SMTP_PASSWORD),
  passwordLength: process.env.SMTP_PASSWORD?.length,
  passwordHasSpaces: /\s/.test(process.env.SMTP_PASSWORD || ""),
});
import {
  sendEmail,
  verifyEmailConnection,
} from "./services/emailService.js";

const testEmail = async () => {
  try {
    console.log("Checking SMTP connection...");

    await verifyEmailConnection();

    console.log("SMTP connection successful!");

    const messageId = await sendEmail({
      to: process.env.SMTP_USER,
      subject: "IT Support System - Email Test",
      text: `
            Hello!

            This is a test email from your IT Support Ticket System.

            If you received this message, your SMTP configuration
            is working successfully.

            Regards,
            IT Support System
      `,
    });

    console.log("Test email sent successfully!");
    console.log("Message ID:", messageId);
  } catch (error) {
    console.error("Email test failed:", error.message);
    process.exitCode = 1;
  }
};

testEmail();
