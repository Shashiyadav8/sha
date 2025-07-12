const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { Parser } = require('json2csv');
const Leave = require('../models/Leave');
const Staff = require('../models/Staff');

// ✅ Get all leaves for the logged-in employee
router.get('/', authenticate, async (req, res) => {
  const employeeCode = req.user.employee_id;

  try {
    const leaves = await Leave.find({ employee_id: employeeCode }).sort({ created_at: -1 });
    res.json(leaves);
  } catch (err) {
    console.error('Error fetching leaves:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Apply for a new leave
router.post('/', authenticate, async (req, res) => {
  const employeeCode = req.user.employee_id;
  const { start_date, end_date, reason } = req.body;

  try {
    const now = new Date();
    const year = now.getFullYear();
    const monthStart = new Date(year, now.getMonth(), 1);
    const monthEnd = new Date(year, now.getMonth() + 1, 0);

    const yearlyCount = await Leave.countDocuments({
      employee_id: employeeCode,
      start_date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
      status: { $in: ['approved', 'pending'] }
    });

    const monthlyCount = await Leave.countDocuments({
      employee_id: employeeCode,
      start_date: { $gte: monthStart, $lte: monthEnd },
      status: { $in: ['approved', 'pending'] }
    });

    if (yearlyCount >= 20) {
      return res.status(400).json({ message: 'Leave limit (20/year) reached' });
    }

    // Just for info (not blocking): log if more than 2 in month
    console.log(`Monthly leave count: ${monthlyCount}`);

    const staff = await Staff.findOne({ employee_id: employeeCode });
    if (!staff) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Leave.create({
      employee_id: employeeCode,
      employee_ref: staff._id,
      start_date,
      end_date,
      reason,
      status: 'pending',
      notification: true
    });

    res.json({
      message: 'Leave request submitted',
      monthly_leaves_used: monthlyCount,
      limit: 2
    });
  } catch (err) {
    console.error('Error applying leave:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Cancel a pending leave
router.delete('/:id', authenticate, async (req, res) => {
  const employeeCode = req.user.employee_id;
  const leaveId = req.params.id;

  try {
    const leave = await Leave.findOne({ _id: leaveId, employee_id: employeeCode });

    if (!leave || leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel this leave' });
    }

    await Leave.findByIdAndDelete(leaveId);
    res.json({ message: 'Leave cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling leave:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Fetch pending notifications
router.get('/notifications', authenticate, async (req, res) => {
  const employeeCode = req.user.employee_id;

  try {
    const notifications = await Leave.find({ employee_id: employeeCode, notification: true });

    await Leave.updateMany(
      { employee_id: employeeCode, notification: true },
      { $set: { notification: false } }
    );

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Export leave data to CSV
router.get('/export', authenticate, async (req, res) => {
  const employeeCode = req.user.employee_id;

  try {
    const rows = await Leave.find({ employee_id: employeeCode })
      .sort({ start_date: -1 })
      .select('start_date end_date reason status')
      .lean();

    const parser = new Parser({ fields: ['start_date', 'end_date', 'reason', 'status'] });
    const csv = parser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('leave_report.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Leave CSV export error:', err);
    res.status(500).json({ message: 'Failed to export leaves' });
  }
});

// ✅ Admin - Get all leave requests
router.get('/admin', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  try {
    const leaves = await Leave.find().sort({ start_date: -1 });

    const formatted = await Promise.all(
      leaves.map(async (leave) => {
        const staff = await Staff.findOne({ employee_id: leave.employee_id });
        return {
          id: leave._id,
          employee_id: leave.employee_id,
          name: staff?.name || 'Unknown',
          start_date: leave.start_date,
          end_date: leave.end_date,
          reason: leave.reason,
          status: leave.status
        };
      })
    );

    res.json(formatted);
  } catch (err) {
    console.error('❌ Failed to fetch leave requests:', err.message);
    res.status(500).json({ message: 'Error fetching leave data' });
  }
});

// ✅ Admin Approve Leave
router.put('/:id/approve', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  try {
    await Leave.findByIdAndUpdate(req.params.id, {
      $set: { status: 'approved', notification: true }
    });
    res.json({ message: 'Leave approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving leave' });
  }
});

// ✅ Admin Reject Leave
router.put('/:id/reject', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  try {
    await Leave.findByIdAndUpdate(req.params.id, {
      $set: { status: 'rejected', notification: true }
    });
    res.json({ message: 'Leave rejected successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting leave' });
  }
});

module.exports = router;
