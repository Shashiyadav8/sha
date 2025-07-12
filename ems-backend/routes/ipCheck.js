const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const AdminSettings = require('../models/AdminSettings');

// ✅ Normalize IP to always use IPv4 format
const normalizeIP = (ip = '') =>
  ip.replace('::ffff:', '').replace('::1', '127.0.0.1').trim();

// ✅ Get all allowed WiFi IPs (for punch-in check)
router.get('/wifi-ips', authenticate, async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();
    const allowedIps = Array.isArray(settings?.allowed_ips)
      ? settings.allowed_ips.map(normalizeIP).filter(Boolean)
      : String(settings?.allowed_ips || '')
          .split(',')
          .map(normalizeIP)
          .filter(Boolean);

    res.json(allowedIps);
  } catch (error) {
    console.error('❌ WiFi IP fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch allowed WiFi IPs' });
  }
});

// ✅ Get allowed device IPs (user-specific devices)
router.get('/device-ips/:userId', authenticate, async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();
    const allowedDevices = Array.isArray(settings?.allowed_devices)
      ? settings.allowed_devices.map(normalizeIP).filter(Boolean)
      : String(settings?.allowed_devices || '')
          .split(',')
          .map(normalizeIP)
          .filter(Boolean);

    res.json(allowedDevices);
  } catch (error) {
    console.error('❌ Device IP fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch device IPs' });
  }
});

// ✅ Get client’s current normalized IP
router.get('/client-ip', (req, res) => {
  const rawIp =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  const ip = normalizeIP(rawIp);
  res.json({ ip });
});

module.exports = router;
