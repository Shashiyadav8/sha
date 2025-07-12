const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticate = require('../middleware/authenticate');
const checkOfficeIP = require('../middleware/checkOfficeIP');
const { Parser } = require('json2csv');
const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');

// Multer setup for uploading photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniq = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + uniq + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Punch In / Out route
router.post('/punch', authenticate, checkOfficeIP, upload.single('photo'), async (req, res) => {
  const empId = req.user._id;
  const empCode = req.user.employee_id;
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ip = rawIP.split(',')[0].replace('::ffff:', '').trim();
  const photo = req.file?.path.replace(/\\/g, '/');

  console.log(`📌 Punch attempt by ${empCode} from IP: ${ip}`);

  try {
    let rec = await Attendance.findOne({ employee_ref: empId, date: today });

    // ✅ Punch In
    if (!rec) {
      if (!photo) {
        return res.status(400).json({ message: 'Photo is required for Punch In.' });
      }

      await Attendance.create({
        employee_ref: empId,
        employee_id: empCode,
        date: today,
        punch_in_time: now,
        ip,
        photo_path: photo
      });

      console.log(`✅ Punch In recorded for ${empCode} at ${now.toLocaleTimeString()}`);
      return res.json({ message: '✅ Punch In successful', type: 'in' });
    }

    // ✅ Punch Out
    if (!rec.punch_out_time) {
      rec.punch_out_time = now;
      rec.ip = ip;
      if (photo) rec.photo_path = photo;
      await rec.save();

      console.log(`✅ Punch Out recorded for ${empCode} at ${now.toLocaleTimeString()}`);
      return res.json({ message: '✅ Punch Out successful', type: 'out' });
    }

    // Already Punched In and Out
    return res.status(400).json({ message: '⚠️ Already punched in and out today.' });
  } catch (err) {
    console.error('❌ Punch Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Status check route
router.get('/status', authenticate, async (req, res) => {
  try {
    const rec = await Attendance.findOne({
      employee_ref: req.user._id,
      date: new Date().toISOString().split('T')[0]
    });

    res.json({
      punch_in: rec?.punch_in_time || null,
      punch_out: rec?.punch_out_time || null
    });
  } catch (err) {
    console.error('Status fetch error:', err);
    res.status(500).json({ message: 'Unable to fetch punch status' });
  }
});

// ✅ Export CSV route
router.get('/export', authenticate, async (req, res) => {
  try {
    const recs = await Attendance.find({});

    if (!recs.length) return res.status(404).json({ message: 'No attendance records found' });

    const rows = recs.map(r => ({
      id: r._id,
      employee_id: r.employee_id || 'N/A',
      date: r.date,
      punch_in: r.punch_in_time,
      punch_out: r.punch_out_time,
      ip: r.ip
    }));

    const csv = new Parser().parse(rows);
    res.header('Content-Type', 'text/csv').attachment('attendance.csv').send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ message: 'Failed to generate CSV' });
  }
});

// ✅ Admin view all records
router.get('/attendance-records', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

  try {
    const recs = await Attendance.find({})
      .populate({ path: 'employee_ref', select: 'name employee_id', strictPopulate: false })
      .sort({ date: -1 });

    const out = recs.map(r => ({
      id: r._id,
      employee_id: r.employee_id || r.employee_ref?.employee_id || 'N/A',
      employee_name: r.employee_ref?.name || 'N/A',
      ip: r.ip || '',
      date: r.date,
      punch_in_time: r.punch_in_time || '',
      punch_out_time: r.punch_out_time || '',
      photo_path: r.photo_path || ''
    }));

    res.json(out);
  } catch (err) {
    console.error('Admin fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// ✅ View selfie photo
router.get('/photo/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

  try {
    const rec = await Attendance.findById(req.params.id);
    if (!rec?.photo_path) return res.status(404).json({ message: 'Photo not found' });

    const fullPath = path.join(__dirname, '..', rec.photo_path);
    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: 'File missing' });

    res.sendFile(fullPath);
  } catch (err) {
    console.error('❌ Photo fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch photo' });
  }
});

module.exports = router;
