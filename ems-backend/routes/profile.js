const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const Staff = require('../models/Staff');

// ✅ GET Profile of the logged-in user
router.get('/', authenticate, async (req, res) => {
  const staffId = req.user.id;

  try {
    const user = await Staff.findById(staffId).select('id employee_id name email phone');

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ UPDATE Profile (name and phone only)
router.put('/', authenticate, async (req, res) => {
  const { name, phone } = req.body;
  const staffId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    await Staff.findByIdAndUpdate(
      staffId,
      { name, phone: phone || null },
      { new: true }
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
