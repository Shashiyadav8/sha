const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Staff = require('../models/Staff');
// If you want a separate log model:
// const LoginLog = require('../models/LoginLog');

const normalizeIP = (ip = '') =>
  ip.replace('::ffff:', '').replace('::1', '127.0.0.1').trim();

// ✅ Login using employee_id and password
router.post('/login', async (req, res) => {
  const { employee_id, password } = req.body;

  try {
    // ✅ Find user
    const user = await Staff.findOne({ employee_id });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // ✅ Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // ✅ Extract & normalize client IP
    const rawHeader = req.headers['x-forwarded-for'] || '';
    const rawIP = rawHeader.split(',')[0].trim() || req.socket.remoteAddress || '';
    const clientIP = normalizeIP(rawIP);

    console.log('------------------------------------------');
    console.log(`✅ LOGIN SUCCESS`);
    console.log(`Employee ID: ${employee_id}`);
    console.log(`Raw x-forwarded-for: ${rawHeader}`);
    console.log(`Raw IP: ${rawIP}`);
    console.log(`Normalized Client IP: ${clientIP}`);
    console.log('------------------------------------------');

    // ✅ OPTION 1: Save last login IP on user model
    // user.last_login_ip = clientIP;
    // await user.save();

    // ✅ OPTION 2: Save login log to separate collection
    /*
    await LoginLog.create({
      employee_id: user.employee_id,
      user_id: user._id,
      ip: clientIP,
      login_at: new Date()
    });
    */

    // ✅ Issue JWT token
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
        role: user.role,
        // last_login_ip: clientIP  // If you want to send it back
      },
      clientIP  // 👈 You can also send it in the response
    });

  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
