const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const bcrypt = require('bcrypt');
const Staff = require('../models/Staff');
const mongoose = require('mongoose');

// GET all employees (admin only)
router.get('/', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  try {
    const employees = await Staff.find({}).select('_id name email phone employee_id position role leave_quota');
    res.json(employees);
  } catch (err) {
    console.error('Fetch employees error:', err);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
});

// POST: Add new employee (admin only)
router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  const { name, email, password, phone, employee_id, position, role } = req.body;

  if (!name || !email || !password || !employee_id) {
    return res.status(400).json({ message: 'Name, email, password, and employee ID are required' });
  }

  try {
    const existing = await Staff.findOne({ employee_id });
    if (existing) {
      return res.status(409).json({ message: 'Employee ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Staff.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      phone: phone || null,
      employee_id,
      position: position || 'N/A'
    });

    res.status(201).json({ message: '✅ Employee added successfully' });
  } catch (err) {
    console.error('Add employee error:', err);
    res.status(500).json({ message: '❌ Failed to add employee' });
  }
});

// DELETE: Remove employee (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: '❌ Invalid or missing employee ID' });
  }

  try {
    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: '❌ Employee not found' });
    }

    res.json({ message: '✅ Employee deleted successfully' });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ message: '❌ Failed to delete employee' });
  }
});

// PUT: Update leave quota (admin only)
router.put('/:id/leave-quota', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  const { id } = req.params;
  const { leave_quota } = req.body;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: '❌ Invalid or missing employee ID' });
  }

  try {
    await Staff.findByIdAndUpdate(id, { leave_quota });
    res.json({ message: '✅ Leave quota updated successfully' });
  } catch (err) {
    console.error('Leave quota update error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Employee profiles (admin only)
router.get('/profiles', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  try {
    const profiles = await Staff.find({ role: 'employee' }).select('_id name email phone role employee_id leave_quota position');
    res.json(profiles);
  } catch (err) {
    console.error('Error fetching employee profiles:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
