import BuySellForm from '../models/Buysellform.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import sanitizeHtml from 'sanitize-html';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false,
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

    // Admin email (with image HTML if available)
    const imagesHtml = cleanImages.length
      ? cleanImages.map(url => `<img src="${url}" alt="Image" style="max-width:300px;margin-bottom:10px;display:block;">`).join('')
      : '';

    const adminMailOptions = {
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

    await transporter.sendMail(adminMailOptions);
    console.log(`📧 Email sent to admin`);

    // Customer confirmation email
    const customerMailOptions = {
      from: `"AGX International" <${process.env.EMAIL_USER}>`,
      to: clean(email),
      subject: 'Thank You for Contacting AGX International',
      html: `
        <h2>Thank You for Reaching Out</h2>
        <p>Dear ${clean(name)},</p>

        <p>Thank you for submitting your <strong>${clean(buySell)}</strong> request with AGX International. We’ve received your form and our team is currently reviewing the details.</p>

        <h3>What Happens Next?</h3>
        <p>One of our representatives will reach out to you shortly (usually within 1–2 business days) based on the timing and industry you selected.</p>

        <h3>Summary of Your Submission:</h3>
        <ul>
          <li><strong>Name:</strong> ${clean(name)}</li>
          <li><strong>Phone:</strong> ${clean(phone)}</li>
          <li><strong>Email:</strong> ${clean(email)}</li>
          <li><strong>Country:</strong> ${clean(country)}</li>
          <li><strong>Drop-off Location:</strong> ${clean(dropOffLocation)}</li>
          <li><strong>Industries:</strong> ${cleanIndustries.join(', ')}</li>
          <li><strong>Timing:</strong> ${clean(timing)}</li>
        </ul>

        <p>If you have any questions, feel free to contact us at <a href="mailto:info@agx-international.com">info@agx-international.com</a>.</p>

        <p>Best regards,<br><strong>AGX International Team</strong></p>
      `,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'NodeMailer',
      },
    };

    await transporter.sendMail(customerMailOptions);
    console.log(`📧 Confirmation email sent to customer: ${email}`);

    res.status(201).json({ message: 'Form submitted, emails sent.' });
  } catch (error) {
    console.error('❌ Buy/Sell form error:', error.stack || error);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
};
