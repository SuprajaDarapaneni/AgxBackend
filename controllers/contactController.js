import Contact from "../models/ContactUs.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import sanitizeHtml from "sanitize-html";

dotenv.config();

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    console.log("📨 Incoming contact form:", { name, email, phone, message });

    // Validate fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Sanitize user inputs
    const cleanName = sanitizeHtml(name.trim());
    const cleanEmail = sanitizeHtml(email.trim());
    const cleanPhone = sanitizeHtml(phone.trim());
    const cleanMessage = sanitizeHtml(message.trim());

    // Save to DB
    const newContact = new Contact({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      message: cleanMessage,
    });

    await newContact.save();
    console.log("✅ Contact saved in database.");

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Compose email
    const mailOptions = {
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND || process.env.EMAIL_USER,
      subject: "📬 New Contact Submission",
      html: `
        <h2>New Message Received</h2>
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Email:</strong> ${cleanEmail}</p>
        <p><strong>Phone:</strong> ${cleanPhone}</p>
        <p><strong>Message:</strong></p>
        <p>${cleanMessage}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${mailOptions.to} | ID: ${info.messageId}`);

    res.status(201).json({ message: "Your message has been sent successfully!" });
  } catch (err) {
    console.error("❌ Contact form error:", err.stack || err.message || err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
