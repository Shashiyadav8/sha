// src/Components/admin/AdminSettingsSection.js
import React, { useEffect, useState } from 'react';
import './AdminSettingsSection.css';

const AdminSettingsSection = () => {
  const [allowedIps, setAllowedIps] = useState('');
  const [allowedDevices, setAllowedDevices] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/settings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();

        setAllowedIps(
          Array.isArray(data.allowed_ips)
            ? data.allowed_ips.join(',')
            : data.allowed_ips || ''
        );

        setAllowedDevices(
          Array.isArray(data.allowed_devices)
            ? data.allowed_devices.join(',')
            : data.allowed_devices || ''
        );

        setStartTime(data.working_hours_start || '');
        setEndTime(data.working_hours_end || '');
      } catch (err) {
        console.error('Error fetching admin settings:', err);
      }
    };

    fetchSettings();
  }, [API_BASE, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedIps = allowedIps
        .split(',')
        .map(ip => ip.trim())
        .filter(Boolean);

      const formattedDevices = allowedDevices
        .split(',')
        .map(ip => ip.trim())
        .filter(Boolean);

      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          allowed_ips: formattedIps,
          allowed_devices: formattedDevices,
          working_start: startTime,
          working_end: endTime
        })
      });

      if (!res.ok) throw new Error('Failed to update settings');
      alert('✅ Settings updated successfully');
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('❌ Failed to update settings');
    }
  };

  return (
    <div className="admin-settings-section">
      <h3>⚙️ Admin Settings</h3>
      <form onSubmit={handleSubmit} className="settings-form">
        <label>Allowed WiFi IPs (comma-separated):</label>
        <input
          type="text"
          value={allowedIps}
          onChange={(e) => setAllowedIps(e.target.value)}
          placeholder="e.g. 192.168.1.1,192.168.0.105"
        />

        <label>Allowed Device IPs (comma-separated):</label>
        <input
          type="text"
          value={allowedDevices}
          onChange={(e) => setAllowedDevices(e.target.value)}
          placeholder="e.g. 192.168.1.100,127.0.0.1"
        />

        <label>Working Start Time:</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <label>Working End Time:</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <button type="submit">Update Settings</button>
      </form>
    </div>
  );
};

export default AdminSettingsSection;
