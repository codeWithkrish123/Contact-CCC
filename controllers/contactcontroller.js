import axios from "axios";
import sendEmail from "../utils/sendEmail.js";

// Sanitize input to prevent XSS
const sanitize = (str) => {
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

// Email validation regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sendContact = async (req, res) => {
  try {
    let { name, email, subject, message, recaptchaResponse } = req.body;

    // Sanitize inputs
    name = sanitize(name?.trim() || "");
    email = email?.trim().toLowerCase();
    subject = sanitize(subject?.trim() || "");
    message = sanitize(message?.trim() || "");

    // Validate fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate message length
    if (message.length < 10) {
      return res.status(400).json({ message: "Message too short (min 10 chars)" });
    }

    // Verify reCAPTCHA (skip if mock token)
    if (recaptchaResponse !== "mock-token") {
      const verifyURL = `https://www.google.com/recaptcha/api/siteverify`;

      const captchaRes = await axios.post(
        verifyURL,
        null,
        {
          params: {
            secret: process.env.RECAPTCHA_SECRET,
            response: recaptchaResponse,
          },
        }
      );

      if (!captchaRes.data.success) {
        return res.status(400).json({ message: "reCAPTCHA verification failed" });
      }
    }

    // Send Email
    await sendEmail({
      name,
      email,
      subject,
      message,
    });

    res.status(200).json({
      message: "Message sent successfully!",
    });

  } catch (error) {
    console.error("Error in sendContact:", error);
    res.status(500).json({
      message: "Failed to send message. Please try again later.",
    });
  }
};