import BuySellForm from '../models/Buysellform.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import sanitizeHtml from 'sanitize-html';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false, // STARTTLS on 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' },
  logger: false,
  debug: false,
});

export const buysell = async (req, res) => {
  try {
    const {
      buySell, name, phone, email, dropOffLocation,
      country, industries, timing, message = '', imageUrls = []
    } = req.body;

    // Validate required fields
    if (!buySell || !name || !phone || !email || !dropOffLocation || !country || !timing) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }
    if (!Array.isArray(industries) || industries.length === 0) {
      return res.status(400).json({ message: 'Select at least one industry.' });
    }

    // Sanitize inputs
    const clean = (str) => sanitizeHtml(str.trim());
    const cleanIndustries = industries.map(clean);
    const cleanImages = Array.isArray(imageUrls) ? imageUrls.map(clean) : [];

    // Save to DB
    const newForm = new BuySellForm({
      buySell: clean(buySell),
      name: clean(name),
      phone: clean(phone),
      email: clean(email),
      dropOffLocation: clean(dropOffLocation),
      country: clean(country),
      industries: cleanIndustries,
      timing: clean(timing),
      message: clean(message),
      imageUrls: cleanImages,
    });

    await newForm.save();
    console.log('✅ Buy/Sell form saved');

    // Compose email HTML with images
    const imagesHtml = cleanImages.length
      ? cleanImages.map(url => `<img src="${url}" alt="Image" style="max-width:300px;margin-bottom:10px;display:block;">`).join('')
      : '';

    const mailOptions = {
      from: `"AGX Buy/Sell" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_SEND || 'info@agx-international.com',
      subject: '📄 New Buy/Sell Form Submission',
      html: `
        <h2>New Submission</h2>
        <p><strong>Type:</strong> ${clean(buySell)}</p>
        <p><strong>Name:</strong> ${clean(name)}</p>
        <p><strong>Phone:</strong> ${clean(phone)}</p>
        <p><strong>Email:</strong> ${clean(email)}</p>
        <p><strong>DropOff Location:</strong> ${clean(dropOffLocation)}</p>
        <p><strong>Country:</strong> ${clean(country)}</p>
        <p><strong>Industries:</strong> ${cleanIndustries.join(', ')}</p>
        <p><strong>Timing:</strong> ${clean(timing)}</p>
        <p><strong>Message:</strong><br>${clean(message)}</p>
        ${imagesHtml ? `<h3>Images:</h3>${imagesHtml}` : ''}
      `,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'NodeMailer',
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);

    res.status(201).json({ message: 'Form submitted and email sent.' });
  } catch (error) {
    console.error('❌ Buy/Sell form error:', error.stack || error);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
};
