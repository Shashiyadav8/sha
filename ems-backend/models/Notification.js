const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  employee_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  type: String,
  message: String,
  read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { collection: 'notifications' });

module.exports = mongoose.model('Notification', notificationSchema);
