import ReviewForm from "../models/reviewForm.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import sanitizeHtml from "sanitize-html";

dotenv.config();

export const submitReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const clean = (str) => sanitizeHtml(str.trim());
    const cleanRating = parseInt(rating);

    if (isNaN(cleanRating) || cleanRating < 1 || cleanRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const newReview = new ReviewForm({
      name: clean(name),
      email: clean(email),
      rating: cleanRating,
      comment: clean(comment),
    });
    await newReview.save();
    console.log("✅ Review saved");

    const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
    const secureFlag = port === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: secureFlag,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: false,
      debug: false,
      tls: { rejectUnauthorized: false },
    });

    await transporter.verify();
    console.log("SMTP ready");

    const mailOptions = {
      from: `"AGX Reviews" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND || process.env.EMAIL_USER,
      subject: "📝 New Customer Review Submitted",
      text: `
New Customer Review
Name: ${clean(name)}
Email: ${clean(email)}
Rating: ${cleanRating} Stars
Comment:
${clean(comment)}
      `,
      html: `
        <h3>New Customer Review</h3>
        <p><strong>Name:</strong> ${clean(name)}</p>
        <p><strong>Email:</strong> ${clean(email)}</p>
        <p><strong>Rating:</strong> ${cleanRating} Stars</p>
        <p><strong>Comment:</strong><br>${clean(comment)}</p>
      `,
      headers: {
        "X-Priority": "3",
        "X-Mailer": "NodeMailer",
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);

    res.status(201).json({ message: "Review submitted successfully." });
  } catch (error) {
    console.error("❌ Review submission error:", error.stack || error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
