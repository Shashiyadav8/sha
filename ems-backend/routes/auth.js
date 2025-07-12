const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendOTP = require('../utils/mailer');
const Staff = require('../models/Staff');

const otpStore = {}; // { email: { otp, expiresAt } }

// ✅ Login using employee_id and password
router.post('/login', async (req, res) => {
  const { employee_id, password } = req.body;

  try {
    const user = await Staff.findOne({ employee_id });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user._id, employee_id: user.employee_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        employee_id: user.employee_id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Request OTP for password reset
router.post('/request-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Staff.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    await sendOTP(email, otp);
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('OTP request error:', err.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// ✅ Verify OTP and update password
router.post('/verify-otp-change-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ message: 'OTP not requested' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await Staff.updateOne({ email }, { $set: { password: hashed } });
    delete otpStore[email];
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password update error:', err.message);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

module.exports = router;
