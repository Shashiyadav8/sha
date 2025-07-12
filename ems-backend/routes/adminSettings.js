// routes/adminSettings.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const AdminSettings = require('../models/AdminSettings');

// ✅ Normalize IP helper (optional, not used here but good for reuse)
const normalizeIP = ip =>
  ip.replace('::ffff:', '').replace('::1', '127.0.0.1').trim();

// ✅ GET current admin settings
router.get('/', authenticate, async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();

    res.json(
      settings || {
        allowed_ips: [],
        allowed_devices: [],
        working_hours_start: '',
        working_hours_end: '',
      }
    );
  } catch (err) {
    console.error('❌ Error fetching admin settings:', err);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// ✅ PUT: Update admin settings
router.put('/', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  try {
    const {
      allowed_ips = [],
      allowed_devices = [],
      working_hours_start = '',
      working_hours_end = '',
    } = req.body;

    // Ensure all are arrays (can also handle comma-separated strings optionally)
    const updated = await AdminSettings.findOneAndUpdate(
      {},
      {
        allowed_ips: Array.isArray(allowed_ips) ? allowed_ips : String(allowed_ips).split(',').map(ip => ip.trim()),
        allowed_devices: Array.isArray(allowed_devices) ? allowed_devices : String(allowed_devices).split(',').map(ip => ip.trim()),
        working_hours_start,
        working_hours_end,
      },
      { upsert: true, new: true }
    );

    res.json({ message: '✅ Settings updated', data: updated });
  } catch (err) {
    console.error('❌ Error updating admin settings:', err);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;
