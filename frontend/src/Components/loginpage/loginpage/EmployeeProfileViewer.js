// src/Components/EmployeeProfileViewer.js
import React, { useEffect, useState } from 'react';
import './EmployeeProfileViewer.css';

const EmployeeProfileViewer = () => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [search, setSearch] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/employees/profiles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profiles');
        const data = await res.json();
        setProfiles(data);
        setFilteredProfiles(data);
      } catch (err) {
        console.error('Failed to load employee profiles', err);
      }
    };

    fetchProfiles();
  }, [API_BASE, token]);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = profiles.filter((emp) =>
      emp.name.toLowerCase().includes(lowerSearch)
    );
    setFilteredProfiles(filtered);
  }, [search, profiles]);

  return (
    <div className="employee-profile-viewer">
      <h3>👥 Employee Profile Viewer</h3>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredProfiles.length === 0 ? (
        <p>No employee data found.</p>
      ) : (
        <div className="profile-card-grid">
          {filteredProfiles.map((emp) => (
            <div className="profile-card" key={emp.id || emp._id}>
              <h4>{emp.name}</h4>
              <p><strong>Email:</strong> {emp.email}</p>
              <p><strong>Phone:</strong> {emp.phone || '-'}</p>
              <p><strong>Role:</strong> {emp.role}</p>
              <p><strong>Leave Quota:</strong> {emp.leave_quota}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeProfileViewer;
