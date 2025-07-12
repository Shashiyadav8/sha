const mongoose = require('mongoose');

const punchCorrectionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  correction_date: {
    type: String,
    required: true
  },
  original_punch_in: Date,
  original_punch_out: Date,
  requested_punch_in: Date,
  requested_punch_out: Date,
  reason: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  admin_comment: String,
  created_at: {
    type: Date,
    default: Date.now
  }
}, { collection: 'punch_corrections' });

module.exports = mongoose.model('PunchCorrection', punchCorrectionSchema);
