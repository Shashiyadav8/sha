// routes/tasks.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const Task = require('../models/Task');
const Staff = require('../models/Staff');

// ✅ Get tasks for the logged-in employee
router.get('/', authenticate, async (req, res) => {
  try {
    const staff = await Staff.findOne({ employee_id: req.user.employee_id });
    if (!staff) return res.status(404).json({ message: 'Employee not found' });

    const tasks = await Task.find({ employee_ref: staff._id }).sort({ created_at: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Add new task (employee creates task for themselves)
router.post('/', authenticate, async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    const staff = await Staff.findOne({ employee_id: req.user.employee_id });
    if (!staff) return res.status(404).json({ message: 'Employee not found' });

    await Task.create({
      employee_id: staff.employee_id,
      employee_ref: staff._id,
      title,
      description
    });

    res.json({ message: 'Task added successfully' });
  } catch (err) {
    console.error('Error adding task:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update task status
router.put('/:id', authenticate, async (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;

  if (!['pending', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const staff = await Staff.findOne({ employee_id: req.user.employee_id });
    if (!staff) return res.status(404).json({ message: 'Employee not found' });

    const completed_at = status === 'completed' ? new Date() : null;

    const result = await Task.updateOne(
      { _id: taskId, employee_ref: staff._id },
      { $set: { status, completed_at } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json({ message: 'Task status updated' });
  } catch (err) {
    console.error('Error updating task:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin: Get all tasks
router.get('/admin', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  try {
    const tasks = await Task.find().sort({ created_at: -1 }).populate('employee_ref', 'name employee_id');

    const tasksWithNames = tasks.map((task) => ({
      id: task._id,
      employee_id: task.employee_ref?.employee_id || task.employee_id,
      name: task.employee_ref?.name || 'Unknown',
      title: task.title,
      description: task.description,
      status: task.status || 'pending',
      created_at: task.created_at,
      completed_at: task.completed_at || null
    }));

    res.json(tasksWithNames);
  } catch (err) {
    console.error('Admin task fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin: Assign a task to an employee
router.post('/assign', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  const { employee_id, title, description } = req.body;
  if (!employee_id || !title || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const staff = await Staff.findOne({ employee_id });
    if (!staff) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Task.create({
      employee_id: staff.employee_id,
      employee_ref: staff._id,
      title,
      description
    });

    res.json({ message: 'Task assigned successfully' });
  } catch (err) {
    console.error('❌ Error assigning task:', err.message);
    res.status(500).json({ message: 'Failed to assign task' });
  }
});

// ✅ Admin: Task overview per employee
router.get('/overview', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  try {
    const staffList = await Staff.find({ role: 'employee' });

    const summary = await Promise.all(
      staffList.map(async (staff) => {
        const total_tasks = await Task.countDocuments({ employee_ref: staff._id });
        const completed_tasks = await Task.countDocuments({ employee_ref: staff._id, status: 'completed' });
        const in_progress_tasks = await Task.countDocuments({ employee_ref: staff._id, status: 'in progress' });
        const pending_tasks = await Task.countDocuments({ employee_ref: staff._id, status: 'pending' });

        return {
          employee_id: staff.employee_id,
          employee_name: staff.name,
          total_tasks,
          completed_tasks,
          in_progress_tasks,
          pending_tasks
        };
      })
    );

    res.json(summary);
  } catch (err) {
    console.error('Overview fetch error:', err.message);
    res.status(500).json({ message: 'Failed to load task overview' });
  }
});

module.exports = router;
