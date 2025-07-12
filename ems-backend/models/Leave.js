const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true
  },
  employee_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notification: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { collection: 'leaves' });

module.exports = mongoose.model('Leave', leaveSchema);
