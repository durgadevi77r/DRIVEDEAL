require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendEnquiryEmail(enquiryData) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    requireTLS: String(process.env.SMTP_SECURE || 'false') !== 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = process.env.EMAIL_SUBJECT || 'New Customer Enquiry Received';
  const fromEmail = process.env.FROM_EMAIL || `"DriveDeal Enquiries" <${process.env.SMTP_USER || 'no-reply@drivedeal.local'}>`;
  const adminEmail = process.env.ADMIN_EMAIL || 'drivedealvk@gmail.com';

  const text = `
Hello Admin,

You have received a new customer enquiry.

Customer Details:
Name: ${enquiryData.name}
Email: ${enquiryData.email}
Phone: ${enquiryData.phone}
Location: ${enquiryData.location || 'Not specified'}

Car Details:
Brand: ${enquiryData.brand || 'Not specified'}
Model: ${enquiryData.model || 'Not specified'}
Year: ${enquiryData.year || 'Not specified'}
Fuel Type: ${enquiryData.fuelType || 'Not specified'}
Price: ₹${enquiryData.price ?? 'Not specified'}

Customer Message:
${enquiryData.message}

Submitted On: ${new Date().toLocaleString()}

Regards,
DriveDeal Enquiries
  `;

  const mailOptions = {
    from: fromEmail,
    to: adminEmail,
    subject,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

module.exports = sendEnquiryEmail;
