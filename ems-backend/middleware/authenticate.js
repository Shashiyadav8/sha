const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    // ✅ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ JWT Verification Failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // ✅ Fetch staff user
    const staff = await Staff.findById(decoded._id || decoded.id).select('_id employee_id name email role');
    if (!staff) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // ✅ Attach full staff user info to request
    req.user = {
      _id: staff._id,               // For use in ref-based schemas (like employee_id)
      id: staff._id.toString(),     // Optional string format
      employee_id: staff.employee_id,
      name: staff.name,
      email: staff.email,
      role: staff.role
    };

    next();
  } catch (err) {
    console.error('❌ Auth Middleware Error:', err.message);
    res.status(500).json({ message: 'Internal server error during authentication' });
  }
};
