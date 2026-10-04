const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_please_change_in_production';

// @route   POST /signup
// @desc    Register user
// @access  Public
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body || {};

  // 1. Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedName = typeof name === 'string' ? name.trim() : '';

  if (!trimmedName) {
    return res.status(400).json({ message: 'Name cannot be empty' });
  }

  // 2. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  // 3. Validate password length
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    let user = await User.findOne({ where: { email: normalizedEmail } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword
    });

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          return res.status(500).json({ message: 'Server error generating token' });
        }
        res.status(201).json({ 
          token, 
          user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar || null } 
        });
      }
    );
  } catch (err) {
    console.error('Signup error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'User already exists' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors?.[0]?.message || 'Validation error' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  try {
    let user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          return res.status(500).json({ message: 'Server error generating token' });
        }
        res.json({ 
          token,
          user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar || null }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
