const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  employee_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  employee_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in progress', 'completed'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  completed_at: {
    type: Date,
    default: null
  }
}, { collection: 'tasks' });

module.exports = mongoose.model('Task', taskSchema);
