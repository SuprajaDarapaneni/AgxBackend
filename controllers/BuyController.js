import BuySellForm from '../models/Buysellform.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import sanitizeHtml from 'sanitize-html';

dotenv.config();

export const buysell = async (req, res) => {
  try {
    const {
      buySell,
      name,
      phone,
      email,
      industries,
      timing,
      message,
      imageUrls = [],
    } = req.body;

    // ✅ Validate required fields
    if (!buySell || !name || !phone || !email || !timing) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!Array.isArray(industries) || industries.length === 0) {
      return res.status(400).json({ message: 'Please select at least one industry.' });
    }

    // ✅ Sanitize inputs
    const cleanBuySell = sanitizeHtml(buySell.trim());
    const cleanMessage = sanitizeHtml(message.trim());

    const cleanName = sanitizeHtml(name.trim());
    const cleanPhone = sanitizeHtml(phone.trim());
    const cleanEmail = sanitizeHtml(email.trim());
    const cleanTiming = sanitizeHtml(timing.trim());
    const cleanIndustries = industries.map(ind => sanitizeHtml(ind.trim()));
    const cleanImages = Array.isArray(imageUrls)
      ? imageUrls.map(url => sanitizeHtml(url.trim()))
      : [];

    // ✅ Save to MongoDB
    const newForm = new BuySellForm({
      buySell: cleanBuySell,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      industries: cleanIndustries,
      timing: cleanTiming,
      message: cleanMessage,
      imageUrls: cleanImages,
    });

    await newForm.save();
    console.log("✅ Form saved to DB");

    // ✅ Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: false, // STARTTLS for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
    });

    // ✅ Build image HTML safely
    const imageHtml = cleanImages.length
      ? cleanImages
          .map(url => `<img src="${url}" alt="Uploaded Image" style="max-width:300px; display:block; margin-bottom:10px;" />`)
          .join('<br/>')
      : '';

    // ✅ Email content
    const mailOptions = {
      from: `"AGX Buy/Sell" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND || 'info@agx-international.com',
      subject: '📄 New Buy/Sell Submission',
      html: `
        <h2>New Buy/Sell Form Submission</h2>
        <p><strong>Type:</strong> ${cleanBuySell}</p>
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Phone:</strong> ${cleanPhone}</p>
        <p><strong>Email:</strong> ${cleanEmail}</p>
        <p><strong>Industries:</strong> ${cleanIndustries.join(', ')}</p>
        <p><strong>Timing:</strong> ${cleanTiming}</p>
        <p><strong>Message:</strong><br>${cleanMessage}</p>

        ${imageHtml ? `<h3>Uploaded Images:</h3>${imageHtml}` : ''}
      `,
    };

    // ✅ Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", info.messageId);

    // ✅ Send response
    res.status(201).json({ message: 'Form submitted and email sent successfully!' });

  } catch (error) {
    console.error('❌ Error handling Buy/Sell form:', error.stack || error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
