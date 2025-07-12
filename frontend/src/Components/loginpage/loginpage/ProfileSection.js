import React, { useEffect, useState } from 'react';
import './ProfileSection.css'; // Ensure CSS is correctly linked

function ProfileSection() {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError('❌ Failed to load profile. Please log in again.');
        console.error('Profile fetch error:', err);
      }
    };

    fetchProfile();
  }, [API_BASE, token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      setMessage('✅ Profile updated successfully!');
      setError('');
    } catch (err) {
      setError('❌ Update failed. Please try again.');
      setMessage('');
      console.error('Profile update error:', err);
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="profile-section">
      <h3>👤 Profile Management</h3>

      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}

      <div className="profile-field">
        <label>Employee ID:</label>
        <input type="text" value={profile.employee_id} disabled />
      </div>

      <div className="profile-field">
        <label>Email:</label>
        <input type="text" value={profile.email} disabled />
      </div>

      <div className="profile-field">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
        />
      </div>

      <div className="profile-field">
        <label>Phone:</label>
        <input
          type="text"
          name="phone"
          value={profile.phone || ''}
          onChange={handleChange}
        />
      </div>

      <button className="save-button" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
}

export default ProfileSection;
