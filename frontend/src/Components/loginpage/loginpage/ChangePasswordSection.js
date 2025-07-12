// src/Components/ChangePasswordSection.js
import React, { useState } from 'react';
import './ChangePasswordSection.css';

const ChangePasswordSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL;

  const toggleForm = () => setShowForm(!showForm);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setStep(2);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp-change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      setMessage(data.message);
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="change-password-container">
      <button className="toggle-button" onClick={toggleForm}>
        {showForm ? 'Close Password Form' : 'Change Password'}
      </button>

      <div className={`form-wrapper ${showForm ? 'open' : ''}`}>
        <h3>Change Password (via OTP)</h3>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <label>OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit">Verify & Change</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordSection;
