const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const Attendance = require('../models/Attendance');

// ✅ Get working hours summary for selected month
router.get('/summary', authenticate, async (req, res) => {
  const employeeId = req.user.id;
  const { month } = req.query; // Format: "YYYY-MM"

  if (!month) return res.status(400).json({ message: 'Month is required' });

  try {
    const [year, monthNumber] = month.split('-').map(Number);

    // Start and end of the month
    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 0, 23, 59, 59); // last day of month

    const records = await Attendance.find({
      employee_id: employeeId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const summary = records.map(record => {
      let hours = 0;
      if (record.punch_in_time && record.punch_out_time) {
        hours = (new Date(record.punch_out_time) - new Date(record.punch_in_time)) / 1000 / 60 / 60;
      }
      return {
        date: record.date.toISOString().split('T')[0],
        punch_in_time: record.punch_in_time,
        punch_out_time: record.punch_out_time,
        hours: Math.round(hours * 100) / 100
      };
    });

    const totalHours = summary.reduce((acc, curr) => acc + curr.hours, 0);

    res.json({ summary, totalHours: Math.round(totalHours * 100) / 100 });
  } catch (err) {
    console.error('❌ Error fetching working hours:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
