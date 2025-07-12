import React, { useEffect, useState, useCallback } from 'react';
import './EmployeeDashboard.css';
import { useNavigate } from 'react-router-dom';
import LeaveSection from './LeaveSection';
import ProfileSection from './ProfileSection';
import TaskSection from './TaskSection';
import ChangePasswordSection from './ChangePasswordSection';
import WorkingHoursSection from './WorkingHoursSection';
import EmployeeCorrectionRequest from './EmployeeCorrectionRequest';

function EmployeeDashboard() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const API_BASE = process.env.REACT_APP_API_URL;

  const [status, setStatus] = useState({ punch_in: null, punch_out: null });
  const [clock, setClock] = useState(new Date());
  const [error, setError] = useState('');
  const [ip, setIp] = useState('');
  const [wifiAllowed, setWifiAllowed] = useState(false);
  const [deviceAllowed, setDeviceAllowed] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [workDuration, setWorkDuration] = useState('00h 00m 00s');
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/attendance/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStatus(data);
      setError('');
    } catch (err) {
      console.error('Status fetch failed:', err);
      setError('Unable to fetch status. Please login again.');
    }
  }, [API_BASE, token]);

  const verifyIPs = useCallback(async () => {
    if (!user) return;

    const normalizeIP = (ip = '') => ip.replace(/\s+/g, '').replace('::ffff:', '').replace('::1', '127.0.0.1');

    try {
      const ipRes = await fetch(`${API_BASE}/api/ip/client-ip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ipData = await ipRes.json();
      const rawIPs = (ipData.ip || '').split(',');
      const primaryIP = normalizeIP(rawIPs[0]);
      setIp(rawIPs.map(normalizeIP).join(', '));

      const wifiRes = await fetch(`${API_BASE}/api/ip/wifi-ips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wifiData = await wifiRes.json();
      setWifiAllowed(wifiData.map(normalizeIP).includes(primaryIP));

      const deviceRes = await fetch(`${API_BASE}/api/ip/device-ips/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deviceData = await deviceRes.json();
      setDeviceAllowed(deviceData.map(normalizeIP).includes(primaryIP));
    } catch (err) {
      console.error('❌ IP verification failed:', err);
      setIp('Error fetching IP');
      setWifiAllowed(false);
      setDeviceAllowed(false);
    }
  }, [API_BASE, token, user]);

  useEffect(() => {
    fetchStatus();
    verifyIPs();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus, verifyIPs]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    let interval = null;
    if (status.punch_in && !status.punch_out) {
      interval = setInterval(() => {
        const start = new Date(status.punch_in);
        const now = new Date();
        const diff = now - start;
        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
        setWorkDuration(`${hours}h ${minutes}m ${seconds}s`);
      }, 1000);
    } else {
      setWorkDuration('00h 00m 00s');
    }
    return () => clearInterval(interval);
  }, [status.punch_in, status.punch_out]);

  const calculateWorkingHours = () => {
    if (status.punch_in && status.punch_out) {
      const punchIn = new Date(status.punch_in);
      const punchOut = new Date(status.punch_out);
      const diff = punchOut - punchIn;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      return `${hours}h ${minutes}m`;
    }
    return 'N/A';
  };

  const handleDownloadAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/attendance/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Attendance download error:', err);
      alert('Failed to download attendance report');
    }
  };

  const handleDownloadLeaves = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/leaves/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leaves.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Leaves download error:', err);
      alert('Failed to download leave report');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
  };

  const handlePunch = async () => {
    if (!wifiAllowed || !deviceAllowed) {
      alert("Punch failed. You're not on allowed WiFi or device.");
      return;
    }

    const isPunchIn = !status.punch_in;

    if (isPunchIn && !photo) {
      alert("Punch In requires a photo. Please upload a selfie.");
      return;
    }

    const formData = new FormData();
    if (isPunchIn) formData.append('photo', photo);

    try {
      const res = await fetch(`${API_BASE}/api/attendance/punch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      alert(data.message);
      fetchStatus();
      if (isPunchIn) setPhoto(null);
    } catch (err) {
      console.error('Punch error:', err);
      alert('Punch failed');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome Employee</h2>
        <div className="clock">{clock.toLocaleTimeString()}</div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-card">
        <p><strong>Your IP(s):</strong> {ip || 'Fetching...'}</p>
        <p><strong>WiFi Allowed:</strong> {wifiAllowed ? '✅' : '❌'}</p>
        <p><strong>Device Allowed:</strong> {deviceAllowed ? '✅' : '❌'}</p>

        {!status.punch_in && (
          <div className="photo-upload">
            <label>Upload Selfie for Punch In:</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            <p><strong>Photo:</strong> {photo ? '✅ Uploaded' : '❌ Not uploaded'}</p>
          </div>
        )}

        <div className="punch-status">
          <h3>Attendance Status (Today)</h3>
          {!status.punch_in && <p className="text-yellow-600 font-medium">❗ You have not punched in yet.</p>}
          {status.punch_in && !status.punch_out && (
            <p className="text-green-600 font-medium">
              ✅ You punched in at {formatTime(status.punch_in)}
            </p>
          )}
          {status.punch_in && status.punch_out && (
            <p className="text-blue-600 font-medium">
              ✅ You punched in at {formatTime(status.punch_in)} and punched out at {formatTime(status.punch_out)}
            </p>
          )}
        </div>

        {status.punch_in && !status.punch_out && (
          <div className="live-timer">
            <p><strong>Live Work Timer:</strong> {workDuration}</p>
          </div>
        )}

        {status.punch_in && status.punch_out && (
          <p><strong>Total Work Duration:</strong> {calculateWorkingHours()}</p>
        )}

        <div className="punch-buttons">
          <button
            onClick={handlePunch}
            disabled={status.punch_in && status.punch_out}
          >
            {status.punch_in ? (status.punch_out ? '✅ Already Punched Out' : 'Punch Out') : 'Punch In'}
          </button>
        </div>

        <div className="download-buttons">
          <h3>Download Reports</h3>
          <button onClick={handleDownloadAttendance}>Download Attendance (CSV)</button>
          <button onClick={handleDownloadLeaves}>Download Leaves (CSV)</button>
        </div>

        {error && <p className="error">{error}</p>}
      </div>

      <WorkingHoursSection />
      <ProfileSection />
      <ChangePasswordSection />
      <EmployeeCorrectionRequest token={token} />
      <TaskSection />
      <LeaveSection token={token} />
    </div>
  );
}

export default EmployeeDashboard;
