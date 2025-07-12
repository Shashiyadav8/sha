import React, { useEffect, useState, useCallback } from 'react';
import './LeaveSection.css';

const LeaveSection = () => {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' });
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const API_BASE = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/leaves`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch leaves');
      const data = await res.json();
      setLeaves(data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Leave apply failed');
      }
      setForm({ start_date: '', end_date: '', reason: '' });
      setMessage('✅ Leave applied successfully');
      setError('');
      fetchLeaves();
    } catch (err) {
      setError(err.message);
      setMessage('');
    }
  };

  const handleCancel = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/leaves/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Cancel failed');
      }
      setMessage('✅ Leave cancelled successfully');
      setError('');
      fetchLeaves();
    } catch (err) {
      setError(err.message);
      setMessage('');
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const leaveMonth = new Date(leave.start_date).toISOString().slice(0, 7);
    const matchMonth = !filterMonth || leaveMonth === filterMonth;
    const matchStatus = !filterStatus || leave.status === filterStatus;
    return matchMonth && matchStatus;
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const leavesThisMonth = leaves.filter(
    (l) =>
      ['approved', 'pending'].includes(l.status) &&
      new Date(l.start_date).toISOString().slice(0, 7) === currentMonth
  ).length;

  return (
    <div className="leave-section">
      <h3>🗓️ Leave Management</h3>

      <form onSubmit={handleApply} className="leave-form">
        <div className="form-row">
          <label>Start Date:</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <label>End Date:</label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <label>Reason:</label>
          <input
            type="text"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          />
        </div>
        <button type="submit">Apply for Leave</button>
      </form>

      <div className="filters">
        <label>Filter Month:</label>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />

        <label>Status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <p><strong>Leaves This Month:</strong> {leavesThisMonth} / 2</p>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {isDesktop ? (
        <table className="leave-table">
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Applied On</th>
              <th>Cancel</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((leave) => (
              <tr key={leave._id}>
                <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                <td>{leave.reason}</td>
                <td>{leave.status}</td>
                <td>{new Date(leave.created_at).toLocaleDateString()}</td>
                <td>
                  {leave.status === 'pending' && (
                    <button onClick={() => handleCancel(leave._id)} className="cancel-button">
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="leave-cards">
          {filteredLeaves.map((leave) => (
            <div key={leave._id} className="leave-card">
              <p><strong>Start:</strong> {new Date(leave.start_date).toLocaleDateString()}</p>
              <p><strong>End:</strong> {new Date(leave.end_date).toLocaleDateString()}</p>
              <p><strong>Reason:</strong> {leave.reason}</p>
              <p><strong>Status:</strong> {leave.status}</p>
              <p><strong>Applied On:</strong> {new Date(leave.created_at).toLocaleDateString()}</p>
              {leave.status === 'pending' && (
                <button onClick={() => handleCancel(leave._id)} className="cancel-button">
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveSection;
