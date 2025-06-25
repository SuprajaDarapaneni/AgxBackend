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
    const clean = (str) => sanitizeHtml(str.trim());
    const cleanName = clean(name);
    const cleanEmail = clean(email);
    const cleanPhone = clean(phone);
    const cleanMessage = clean(message);

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
      tls: { rejectUnauthorized: false },
    });

    await transporter.verify();
    console.log("📬 SMTP server ready.");

    // Email to admin
    const adminMailOptions = {
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

    await transporter.sendMail(adminMailOptions);
    console.log(`✅ Admin email sent: ${adminMailOptions.to}`);

    // Confirmation email to customer
    const customerMailOptions = {
      from: `"AGX International" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Thank You for Contacting AGX International",
      html: `
        <h2>Thank You for Your Message</h2>
        <p>Dear ${cleanName},</p>

        <p>Thank you for getting in touch with us through our website. We have received your message and one of our team members will contact you shortly.</p>

        <h3>Your Message Summary:</h3>
        <ul>
          <li><strong>Name:</strong> ${cleanName}</li>
          <li><strong>Email:</strong> ${cleanEmail}</li>
          <li><strong>Phone:</strong> ${cleanPhone}</li>
        </ul>
        <p><strong>Message:</strong><br>${cleanMessage}</p>

        <p>
  If your inquiry is urgent, feel free to call or email us directly at
  <a href="mailto:info@agx-international.com">info@agx-international.com</a>.
</p>


        <p>Best regards,<br><strong>AGX International Team</strong></p>
      `,
    };

    await transporter.sendMail(customerMailOptions);
    console.log(`📧 Confirmation email sent to customer: ${cleanEmail}`);

    res.status(201).json({ message: "Your message has been sent successfully!" });
  } catch (err) {
    console.error("❌ Contact form error:", err.stack || err.message || err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
