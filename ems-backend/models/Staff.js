const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  position: {             // ✅ ADD THIS FIELD
    type: String,
    default: ''
  },
  leave_quota: {
    type: Number,
    default: 12
  }
}, { collection: 'staff', timestamps: true }); // ✅ Add timestamps for createdAt/updatedAt

module.exports = mongoose.model('Staff', staffSchema);
