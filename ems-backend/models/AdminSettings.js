// models/AdminSettings.js
const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  allowed_ips: {
    type: [String],
    default: [],
  },
  allowed_devices: {
    type: [String],
    default: [],
  },
  working_hours_start: String,
  working_hours_end: String,
}, { collection: 'adminsettings' });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
