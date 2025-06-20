import ReviewForm from "../models/ReviewForm.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import sanitizeHtml from "sanitize-html";

dotenv.config();

export const submitReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    // Validate required fields
    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Sanitize input
    const cleanName = sanitizeHtml(name.trim());
    const cleanEmail = sanitizeHtml(email.trim());
    const cleanRating = parseInt(rating);
    const cleanComment = sanitizeHtml(comment.trim());

    if (isNaN(cleanRating) || cleanRating < 1 || cleanRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Save review to DB
    const newReview = new ReviewForm({
      name: cleanName,
      email: cleanEmail,
      rating: cleanRating,
      comment: cleanComment,
    });
    await newReview.save();
    console.log("✅ Review saved to database.");

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., smtpout.secureserver.net
      port: parseInt(process.env.EMAIL_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: false,
    });

    // Optional: verify transporter connection
    await transporter.verify();

    const mailOptions = {
      from: `"AGX Reviews" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND || process.env.EMAIL_USER,
      subject: "📝 New Customer Review Submitted",
      html: `
        <h3>New Customer Review</h3>
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Email:</strong> ${cleanEmail}</p>
        <p><strong>Rating:</strong> ${cleanRating} Stars</p>
        <p><strong>Comment:</strong><br>${cleanComment}</p>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`📨 Review email sent to ${mailOptions.to} | ID: ${info.messageId}`);

    res.status(201).json({ message: "Review submitted successfully." });
  } catch (error) {
    console.error("❌ Error submitting review:", error.stack || error);
    res.status(500).json({ message: "Failed to submit review. Please try again later." });
  }
};
