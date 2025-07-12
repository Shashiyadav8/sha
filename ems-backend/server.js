const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const workingHoursRoutes = require('./routes/workingHours');
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leave');
const profileRoutes = require('./routes/profile');
const taskRoutes = require('./routes/task');
const adminAnalyticsRoutes = require('./routes/adminAnalytics');
const settingsRoutes = require('./routes/adminSettings');
const ipCheckRoutes = require('./routes/ipCheck');
const punchCorrectionRoutes = require('./routes/punchCorrection');

const app = express();
app.set('trust proxy', true); // ✅ Enable trust proxy to get correct client IP on Render

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance', workingHoursRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminAnalyticsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/ip', ipCheckRoutes);
app.use('/api/corrections', punchCorrectionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
