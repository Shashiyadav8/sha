// src/Components/AdminCorrectionPanel.js
import React, { useEffect, useState, useCallback } from 'react';
import './AdminDashboard.css';

function AdminCorrectionPanel({ token }) {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [modalData, setModalData] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL;

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/corrections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch corrections');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error('❌ Failed to fetch corrections:', err);
    }
  }, [token, API_BASE]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatDateTime = (dt) => {
    try {
      if (!dt) return '-';
      const dateObj = new Date(dt);
      return isNaN(dateObj.getTime())
        ? '-'
        : dateObj.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            hour12: true
          });
    } catch {
      return '-';
    }
  };

  const formatDate = (d) => {
    try {
      if (!d) return '-';
      const dateObj = new Date(d);
      return isNaN(dateObj.getTime())
        ? '-'
        : dateObj.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
    } catch {
      return '-';
    }
  };

  const openModal = (req, actionType) => {
    setModalData({ ...req, actionType, admin_comment: '', id: req.id });
  };

  const handleModalSubmit = async () => {
    const { id, actionType, admin_comment } = modalData;

    try {
      const res = await fetch(`${API_BASE}/api/corrections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: actionType, admin_comment })
      });

      if (!res.ok) throw new Error('Failed to update correction');
      setModalData(null);
      fetchRequests();
    } catch (err) {
      console.error('❌ Failed to update correction:', err);
      alert('Update failed');
    }
  };

  const filteredRequests = requests.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase()) &&
    (!filter || r.status === filter)
  );

  return (
    <div className="correction-panel">
      <h3>🛠 Correction Requests</h3>

      <div className="correction-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Original</th>
            <th>Requested</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map(r => (
            <tr key={r.id}>
              <td data-label="User">{r.name}</td>
              <td data-label="Original">
                {formatDateTime(r.original_punch_in)} / {formatDateTime(r.original_punch_out)}
              </td>
              <td data-label="Requested">
                {formatDateTime(r.requested_punch_in)} / {formatDateTime(r.requested_punch_out)}
              </td>
              <td data-label="Reason">{r.reason}</td>
              <td data-label="Status">{r.status}</td>
              <td data-label="Action">
                {r.status === 'pending' ? (
                  <>
                    <button className="approve-btn" onClick={() => openModal(r, 'approved')}>✅</button>
                    <button className="reject-btn" onClick={() => openModal(r, 'rejected')}>❌</button>
                  </>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalData && (
        <div className="correction-modal-overlay">
          <div className="correction-modal">
            <h4>{modalData.actionType === 'approved' ? 'Approve' : 'Reject'} Correction</h4>
            <p><strong>User:</strong> {modalData.name}</p>
            <p><strong>Correction Date:</strong> {formatDate(modalData.correction_date)}</p>
            <p><strong>Original:</strong> {formatDateTime(modalData.original_punch_in)} / {formatDateTime(modalData.original_punch_out)}</p>
            <p><strong>Requested:</strong> {formatDateTime(modalData.requested_punch_in)} / {formatDateTime(modalData.requested_punch_out)}</p>
            <p><strong>Reason:</strong> {modalData.reason}</p>

            <textarea
              rows={4}
              placeholder="Admin comment..."
              value={modalData.admin_comment}
              onChange={(e) => setModalData({ ...modalData, admin_comment: e.target.value })}
            />

            <div className="modal-buttons">
              <button className="submit-btn" onClick={handleModalSubmit}>
                Confirm {modalData.actionType}
              </button>
              <button className="cancel-btn" onClick={() => setModalData(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCorrectionPanel;
