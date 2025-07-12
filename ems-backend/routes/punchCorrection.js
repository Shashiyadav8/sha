const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const PunchCorrection = require('../models/PunchCorrection');
const Attendance = require('../models/Attendance');

// ✅ Employee: Submit correction request
router.post('/', authenticate, async (req, res) => {
  const { requested_punch_in, requested_punch_out, reason } = req.body;
  const employeeId = req.user._id;

  try {
    const correction_date =
      (requested_punch_in && new Date(requested_punch_in).toISOString().split('T')[0]) ||
      (requested_punch_out && new Date(requested_punch_out).toISOString().split('T')[0]);

    if (!correction_date || (!requested_punch_in && !requested_punch_out)) {
      return res.status(400).json({ message: '❌ Invalid correction data.' });
    }

    // Fetch attendance using correct schema field
    const attendance = await Attendance.findOne({
      employee_ref: employeeId,
      date: correction_date
    });

    const original_punch_in = attendance?.punch_in_time || null;
    const original_punch_out = attendance?.punch_out_time || null;

    await PunchCorrection.create({
      user_id: employeeId,
      correction_date,
      original_punch_in,
      original_punch_out,
      requested_punch_in,
      requested_punch_out,
      reason,
      status: 'pending'
    });

    res.json({ message: '✅ Correction request submitted' });
  } catch (err) {
    console.error('❌ Correction request error:', err);
    res.status(500).json({ message: '❌ Failed to submit correction' });
  }
});

// ✅ Admin: View all correction requests
router.get('/', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  try {
    const corrections = await PunchCorrection.find()
      .populate('user_id', 'name employee_id')
      .sort({ created_at: -1 });

    const result = corrections.map(c => ({
      id: c._id,
      name: c.user_id?.name || 'Unknown',
      employee_id: c.user_id?.employee_id || 'N/A',
      correction_date: c.correction_date,
      original_punch_in: c.original_punch_in,
      original_punch_out: c.original_punch_out,
      requested_punch_in: c.requested_punch_in,
      requested_punch_out: c.requested_punch_out,
      reason: c.reason,
      status: c.status,
      admin_comment: c.admin_comment,
      created_at: c.created_at
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ Fetch corrections error:', err);
    res.status(500).json({ message: '❌ Failed to fetch corrections' });
  }
});

// ✅ Admin: Approve or reject correction
router.put('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  const { id } = req.params;
  const { status, admin_comment } = req.body;

  if (!id || id.length !== 24) {
    return res.status(400).json({ message: 'Invalid correction ID' });
  }

  try {
    const correction = await PunchCorrection.findByIdAndUpdate(
      id,
      { status, admin_comment },
      { new: true }
    );

    if (!correction) {
      return res.status(404).json({ message: 'Correction not found' });
    }

    if (status === 'approved') {
      const {
        user_id,
        correction_date,
        requested_punch_in,
        requested_punch_out
      } = correction;

      const updateFields = {};
      if (requested_punch_in) updateFields.punch_in_time = requested_punch_in;
      if (requested_punch_out) updateFields.punch_out_time = requested_punch_out;

      const existing = await Attendance.findOne({
        employee_ref: user_id,
        date: correction_date
      });

            if (existing) {
        await Attendance.updateOne(
          { employee_ref: user_id, date: correction_date },
          { $set: updateFields }
        );
      } else {
        const employee = await require('../models/Staff').findById(user_id).select('employee_id');
        await Attendance.create({
          employee_ref: user_id,
          employee_id: employee.employee_id, // ✅ added
          date: correction_date,
          ...updateFields
        });
      }

    }

    res.json({ message: '✅ Correction updated successfully' });
  } catch (err) {
    console.error('❌ Update correction error:', err);
    res.status(500).json({ message: '❌ Failed to update correction' });
  }
});

module.exports = router;
