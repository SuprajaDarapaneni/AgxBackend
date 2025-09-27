import sanitizeHtml from 'sanitize-html';
import BuySellForm from '../models/Buysellform.js';
import nodemailer from 'nodemailer';

// Debug environment variables for SMTP config


// Setup nodemailer transporter using env variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,               // e.g., smtp.gmail.com
  port: Number(process.env.EMAIL_PORT),       // e.g., 587
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465 SSL, false for 587 STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,  // helps avoid some certificate issues, optional
  },
});


console.log('--- SMTP Config Debug ---');
console.log('SMTP_HOST:', process.env.EMAIL_HOST);
console.log('SMTP_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '[set]' : '[not set]');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '[set]' : '[not set]');
console.log('EMAIL_SEND:', process.env.EMAIL_SEND || 'default admin email');
console.log('-------------------------');
export const buysell = async (req, res) => {
  try {
    const {
      buySell,
      name,
      phone,
      email,
      dropOffLocation,
      country,
      industries,
      timing,
      expectedDate,
      message = '',
      imageUrls = [],
    } = req.body;

    // Validate required fields
    if (
      !buySell ||
      !name ||
      !phone ||
      !email ||
      !dropOffLocation ||
      !country ||
      !timing ||
      !expectedDate
    ) {
      console.warn('⚠️ Missing required fields');
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    if (!Array.isArray(industries) || industries.length === 0) {
      console.warn('⚠️ No industries selected');
      return res.status(400).json({ message: 'Select at least one industry.' });
    }

    // Sanitize helper
    const clean = (str) => (typeof str === 'string' ? sanitizeHtml(str.trim()) : '');

    const cleanIndustries = industries.map(clean);
    const cleanImages = Array.isArray(imageUrls) ? imageUrls.map(clean) : [];

    // Validate expected date
    const parsedDate = new Date(expectedDate);
    if (isNaN(parsedDate.getTime())) {
      console.warn('⚠️ Invalid expected date:', expectedDate);
      return res.status(400).json({ message: 'Invalid expected date.' });
    }

    // Save form
    const newForm = new BuySellForm({
      buySell: clean(buySell),
      name: clean(name),
      phone: clean(phone),
      email: clean(email),
      dropOffLocation: clean(dropOffLocation),
      country: clean(country),
      industries: cleanIndustries,
      timing: clean(timing),
      expectedDate: parsedDate,
      message: clean(message),
      imageUrls: cleanImages,
    });

    await newForm.save();
    console.log('✅ Buy/Sell form saved to DB');
console.log('SMTP host:', process.env.EMAIL_HOST);
console.log('SMTP port:', process.env.EMAIL_PORT);
console.log('Email user:', process.env.EMAIL_USER);

    // Prepare images HTML
    const imagesHtml = cleanImages.length
      ? cleanImages
          .map(
            (url) =>
              `<img src="${url}" alt="Image" style="max-width:300px;margin-bottom:10px;display:block;">`
          )
          .join('')
      : '';

    // Admin email options
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
        
        <p><strong>Expected Date:</strong> ${parsedDate.toDateString()}</p>
        <p><strong>Message:</strong><br>${clean(message)}</p>
        ${imagesHtml ? `<h3>Images:</h3>${imagesHtml}` : ''}
      `,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'NodeMailer',
      },
    };

    console.log('📧 Sending admin email to:', adminMailOptions.to);
    await transporter.sendMail(adminMailOptions);
    console.log('📧 Admin email sent');

    // Customer email options
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
          
          <li><strong>Expected Date:</strong> ${parsedDate.toDateString()}</li>
        </ul>

        <p>If you have any questions, feel free to contact us at <a href="mailto:info@agx-international.com">info@agx-international.com</a>.</p>

        <p>Best regards,<br><strong>AGX International Team</strong></p>
      `,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'NodeMailer',
      },
    };

    console.log('📧 Sending confirmation email to customer:', clean(email));
    await transporter.sendMail(customerMailOptions);
    console.log('📧 Customer confirmation email sent');
//<li><strong>Timing:</strong> ${clean(timing)}</li>
    res.status(201).json({ message: 'Form submitted, emails sent.' });
  } catch (error) {
    console.error('❌ Buy/Sell form error:', error.stack || error);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
};
