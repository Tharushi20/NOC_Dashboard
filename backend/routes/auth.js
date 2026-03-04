import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const ensureCriticalDbConfigured = (req, res, next) => {
  if (!process.env.MONGODB_URI && !process.env.MONGO_URI2) {
    return res.status(503).json({ error: 'Critical Alert DB is not configured (set MONGODB_URI or MONGO_URI2).' });
  }
  next();
};

router.post('/register', ensureCriticalDbConfigured, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = new User({ username, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', ensureCriticalDbConfigured, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;