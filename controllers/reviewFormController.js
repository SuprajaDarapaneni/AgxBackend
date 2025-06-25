import ReviewForm from "../models/reviewForm.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import sanitizeHtml from "sanitize-html";

dotenv.config();

export const submitReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    // Validate input
    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const clean = (str) => sanitizeHtml(str.trim());
    const cleanRating = parseInt(rating);

    if (isNaN(cleanRating) || cleanRating < 1 || cleanRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Save to database
    const newReview = new ReviewForm({
      name: clean(name),
      email: clean(email),
      rating: cleanRating,
      comment: clean(comment),
    });

    await newReview.save();
    console.log("✅ Review saved");

    // Setup email transporter
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
    console.log("📬 SMTP ready");

    // Send admin notification
    const adminMailOptions = {
      from: `"AGX Reviews" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND || process.env.EMAIL_USER,
      subject: "📝 New Customer Review Submitted",
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

    await transporter.sendMail(adminMailOptions);
    console.log(`📧 Admin email sent`);

    // Send confirmation to customer
    const customerMailOptions = {
      from: `"AGX International" <${process.env.EMAIL_USER}>`,
      to: clean(email),
      subject: "Thank You for Your Review!",
      html: `
        <h2>Thank You for Your Feedback!</h2>
        <p>Dear ${clean(name)},</p>

        <p>We appreciate you taking the time to leave a review. Your feedback helps us improve and continue delivering high-quality service.</p>

        <h3>Your Review:</h3>
        <ul>
          <li><strong>Rating:</strong> ${cleanRating} Stars</li>
          <li><strong>Comment:</strong><br>${clean(comment)}</li>
        </ul>

        <p>If you have any additional questions or suggestions, feel free to reply to this email or contact us directly at <a href="mailto:info@agx-international.com">info@agx-international.com</a>.</p>

        <p>Best regards,<br><strong>AGX International Team</strong></p>
      `,
      headers: {
        "X-Priority": "3",
        "X-Mailer": "NodeMailer",
      },
    };

    await transporter.sendMail(customerMailOptions);
    console.log(`📧 Thank-you email sent to customer: ${email}`);

    res.status(201).json({ message: "Review submitted and emails sent." });
  } catch (error) {
    console.error("❌ Review submission error:", error.stack || error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
