import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import sanitizeHtml from "sanitize-html";
// import ReviewForm from "../models/reviewForm.js"; // Uncomment if saving to DB

dotenv.config();
const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const { name, rating, comment } = req.body;

    // Validation
    if (!name || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Basic rating validation
    const cleanRating = parseInt(rating);
    if (isNaN(cleanRating) || cleanRating < 1 || cleanRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Sanitize inputs to prevent injection/XSS
    const cleanName = sanitizeHtml(name.trim());
    const cleanComment = sanitizeHtml(comment.trim());

    // Optional: Save to MongoDB
    // const newReview = new ReviewForm({ name: cleanName, rating: cleanRating, comment: cleanComment });
    // await newReview.save();

    // Setup Nodemailer transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,     // e.g. your Gmail address
        pass: process.env.EMAIL_PASS,     // App-specific password (not your Gmail password)
      },
    });

    const mailOptions = {
      from: `"Review Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND,
      subject: "📝 New Customer Review Received",
      html: `
        <h2>New Review Submitted</h2>
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Rating:</strong> ${cleanRating} Stars</p>
        <p><strong>Comment:</strong><br>${cleanComment}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Review email sent:", info.messageId);

    res.status(200).json({ message: "Review submitted and emailed successfully." });
  } catch (error) {
    console.error("❌ Review Submission Error:", error.stack || error.message);
    res.status(500).json({ message: "An error occurred while submitting the review." });
  }
});

export default router;
