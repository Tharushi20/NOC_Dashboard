import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';

import problemRoutes from './routes/Problem.js';
import authRoutes from './routes/auth.js';
import emailRoutes from './routes/email.js';
import ticketRoutes from './routes/tickets.js';

dotenv.config();

const app = express();

// Allow frontend access
app.use(cors());
app.use(express.json());

// Serve static files (for legacy critical alert public assets, if any)
app.use(express.static('public'));

// Match legacy behavior for self-signed certs (if used)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// =======================
// MongoDB Connection
// =======================
// Existing Problem Library connection (kept intact)
mongoose.connect(process.env.MONGO_URI1)
  .then(() => console.log('Connected to MongoDB (Problem Library / shared DB)'))
  .catch(err => console.error('MongoDB connection error:', err));

// =======================
// Multer Setup
// =======================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// =======================
// Routes
// =======================

// Problem Library
app.use('/api/problems', problemRoutes);

// Critical Alert System
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);

// Open Ticket System
app.use('/api/tickets', ticketRoutes);

// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));