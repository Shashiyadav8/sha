const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  employee_id: {
    type: String, // ✅ NEW FIELD
    required: true
  },
  date: {
    type: String,
    required: true
  },
  punch_in_time: Date,
  punch_out_time: Date,
  ip: String,
  photo_path: String
}, { collection: 'attendance' });

module.exports = mongoose.model('Attendance', attendanceSchema);
