import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import RecipientGroup from '../models/RecipientGroup.js';
import generateHtml from '../utils/emailTemplate.js';

const router = express.Router();

// JWT authentication middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Fetch all machines (by IP)
router.get('/groups', auth, async (req, res) => {
  try {
    const machines = await RecipientGroup.find().select('ip error_description machine_location');
    res.json(machines);
  } catch (err) {
    console.error('Fetch machines error:', err);
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
});

// Fetch single machine details by IP
router.get('/groups/:ip', auth, async (req, res) => {
  try {
    const machine = await RecipientGroup.findOne({ ip: req.params.ip });
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    res.json({
      ip: machine.ip,
      error_description: machine.error_description,
      machine_location: machine.machine_location
    });
  } catch (err) {
    console.error('Fetch machine details error:', err);
    res.status(500).json({ error: 'Failed to fetch machine details' });
  }
});

// Send email
router.post('/send', auth, async (req, res) => {
  try {
    const data = req.body;
    console.log('Received send request with data:', data);

    // Validate required fields
    const requiredFields = ['ip', 'error_description', 'machine_location'];
    for (const field of requiredFields) {
      if (!data[field]) return res.status(400).json({ error: `${field} is required` });
    }

    // Check email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ error: 'Email configuration not found' });
    }

    // Use the data directly (no database lookup needed)
    const emailData = {
      machine_ip: data.ip,
      error_description: data.error_description,
      machine_location: data.machine_location
    };

    const html = generateHtml(emailData);

    // Nodemailer transporter for Outlook / Office 365
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App Password (no spaces)
      }
    });

    // Send email - using a default recipient since we don't have to/cc in new model
    const defaultEmail = process.env.DEFAULT_EMAIL || process.env.EMAIL_USER;
    await transporter.sendMail({
      from: `"NOC Team" <${process.env.EMAIL_USER}>`,
      to: defaultEmail,
      subject: `[ALERT] Machine Error - ${data.ip || 'Unknown IP'}`,
      html
    });

    res.json({ message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Send email error:', err);
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

export default router;
