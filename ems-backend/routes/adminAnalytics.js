const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const Staff = require('../models/Staff');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Task = require('../models/Task');

router.get('/analytics', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  try {
    const employees = await Staff.find({ role: 'employee' }).select('_id name');
    const stats = [];

    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    for (const emp of employees) {
      const records = await Attendance.find({
        employee_ref: emp._id,
        punch_in_time: { $ne: null },
        punch_out_time: { $ne: null },
        date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] }
      });

      const present_days = records.length;
      const totalMinutes = records.reduce((acc, rec) => {
        const inTime = new Date(rec.punch_in_time);
        const outTime = new Date(rec.punch_out_time);
        return acc + (outTime - inTime) / (1000 * 60); // convert to minutes
      }, 0);

      const avg_hours = present_days ? +(totalMinutes / 60 / present_days).toFixed(2) : 0;

      // ✅ Fix: use employee_ref instead of employee_id
      const total_leaves = await Leave.countDocuments({ employee_ref: emp._id });

      const taskStats = await Task.aggregate([
        { $match: { employee_ref: emp._id } },
        {
          $group: {
            _id: null,
            total_tasks: { $sum: 1 },
            completed_tasks: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        }
      ]);

      stats.push({
        id: emp._id,
        name: emp.name,
        present_days,
        avg_hours,
        total_leaves,
        total_tasks: taskStats[0]?.total_tasks || 0,
        completed_tasks: taskStats[0]?.completed_tasks || 0
      });
    }

    res.json({ employeeStats: stats });
  } catch (err) {
    console.error('❌ Analytics fetch error:', err.message);
    res.status(500).json({ message: 'Server error in analytics' });
  }
});

module.exports = router;
