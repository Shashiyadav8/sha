// middleware/checkOfficeIP.js
const AdminSettings = require('../models/AdminSettings');

const normalizeIP = (ip = '') =>
  ip.replace('::ffff:', '').replace('::1', '127.0.0.1').trim();

module.exports = async (req, res, next) => {
  try {
    // Extract all IPs from x-forwarded-for (comma separated)
    const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const forwardedIPs = rawIP.split(',').map(normalizeIP);
    const clientIP = forwardedIPs[0]; // Display only first one for reference

    console.log(`\u{1F50D} Client IPs:`, forwardedIPs);

    // Allow localhost in dev mode
    if (forwardedIPs.includes('127.0.0.1')) {
      req.networkCheck = { clientIP, ipAllowed: true, deviceAllowed: true };
      return next();
    }

    const settings = await AdminSettings.findOne();
    if (!settings) {
      return res.status(500).json({ message: 'Admin settings not configured' });
    }

    const allowed_ips = (Array.isArray(settings.allowed_ips)
      ? settings.allowed_ips
      : String(settings.allowed_ips).split(',')
    ).map(normalizeIP).filter(Boolean);

    const allowed_devices = (Array.isArray(settings.allowed_devices)
      ? settings.allowed_devices
      : String(settings.allowed_devices).split(',')
    ).map(normalizeIP).filter(Boolean);

    const ipAllowed = forwardedIPs.some(ip => allowed_ips.includes(ip));
    const deviceAllowed = forwardedIPs.some(ip => allowed_devices.includes(ip));

    req.networkCheck = { clientIP, ipAllowed, deviceAllowed };

    console.log('✅ Allowed IPs:', allowed_ips);
    console.log('✅ Allowed Devices:', allowed_devices);
    console.log(`➡️ Matched IP: ${clientIP}, ipAllowed: ${ipAllowed}, deviceAllowed: ${deviceAllowed}`);

    if (!ipAllowed && !deviceAllowed) {
      return res.status(403).json({
        message: 'Access denied. Not on allowed WiFi or device.',
        clientIP,
        ipAllowed,
        deviceAllowed
      });
    }

    next();
  } catch (err) {
    console.error('❌ checkOfficeIP Error:', err);
    res.status(500).json({ message: 'Internal server error during IP check' });
  }
};
