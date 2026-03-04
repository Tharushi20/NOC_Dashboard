import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import RecipientGroup from '../models/RecipientGroup.js';
import generateHtml from '../utils/emailTemplate.js';

const router = express.Router();

const ensureCriticalDbConfigured = (req, res, next) => {
  if (!process.env.MONGODB_URI && !process.env.MONGO_URI2) {
    return res.status(503).json({ error: 'Critical Alert DB is not configured (set MONGODB_URI or MONGO_URI2).' });
  }
  next();
};

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

// Fetch all group names
router.get('/groups', ensureCriticalDbConfigured, auth, async (req, res) => {
  try {
    const groups = await RecipientGroup.find().select('name');
    res.json(groups.map(g => g.name));
  } catch (err) {
    console.error('Fetch groups error:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Fetch single group details
router.get('/groups/:groupName', ensureCriticalDbConfigured, auth, async (req, res) => {
  try {
    const group = await RecipientGroup.findOne({ name: req.params.groupName });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json({ to: group.to, cc: group.cc });
  } catch (err) {
    console.error('Fetch group details error:', err);
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// Send email
router.post('/send', ensureCriticalDbConfigured, auth, async (req, res) => {
  try {
    const data = req.body;
    console.log('Received send request with data:', data);

    // Validate required fields
    const requiredFields = ['recipient_group', 'trigger_name', 'host_name', 'host_ip'];
    for (let field of requiredFields) {
      if (!data[field]) return res.status(400).json({ error: `${field} is required` });
    }

    const group = await RecipientGroup.findOne({ name: data.recipient_group });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Check email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ error: 'Email configuration not found' });
    }

    const html = generateHtml(data);

    // ✅ Correct Nodemailer transporter for Outlook / Office 365
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App Password (no spaces)
      }
    });

    // Send email
    await transporter.sendMail({
      from: `"NOC Team" <${process.env.EMAIL_USER}>`,
      to: group.to.split(';').map(e => e.trim()).filter(Boolean),
      cc: group.cc.split(';').map(e => e.trim()).filter(Boolean),
      subject: data.trigger_name,
      html
    });

    res.json({ message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Send email error:', err);
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

export default router;
