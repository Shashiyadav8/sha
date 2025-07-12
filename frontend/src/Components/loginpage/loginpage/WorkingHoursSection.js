import React, { useEffect, useState } from 'react';
import './WorkingHoursSection.css';

const WorkingHoursSection = () => {
  const [month, setMonth] = useState('');
  const [summary, setSummary] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!month) return;

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        return;
      }

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/attendance/summary?month=${month}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch summary');
        }

        const data = await res.json();
        setSummary(data.summary);
        setTotalHours(data.totalHours);
      } catch (err) {
        console.error('Failed to fetch summary:', err);
      }
    };

    fetchSummary();
  }, [month]);

  return (
    <div className="working-hours-section">
      <h3>📊 Working Hours Summary</h3>

      <label>Select Month:</label>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      />

      {summary.length > 0 ? (
        <>
          {/* Desktop Table */}
          <table className="desktop-only">
            <thead>
              <tr>
                <th>Date</th>
                <th>Punch In</th>
                <th>Punch Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((record, idx) => (
                <tr key={idx}>
                  <td>{record.date}</td>
                  <td>{record.punch_in_time ? new Date(record.punch_in_time).toLocaleTimeString() : '-'}</td>
                  <td>{record.punch_out_time ? new Date(record.punch_out_time).toLocaleTimeString() : '-'}</td>
                  <td>{record.hours}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="3"><strong>Total Hours</strong></td>
                <td><strong>{totalHours.toFixed(2)} hrs</strong></td>
              </tr>
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="mobile-only">
            {summary.map((record, idx) => (
              <div className="working-hours-card" key={idx}>
                <p><strong>Date:</strong> {record.date}</p>
                <p><strong>Punch In:</strong> {record.punch_in_time ? new Date(record.punch_in_time).toLocaleTimeString() : '-'}</p>
                <p><strong>Punch Out:</strong> {record.punch_out_time ? new Date(record.punch_out_time).toLocaleTimeString() : '-'}</p>
                <p><strong>Hours:</strong> {record.hours}</p>
              </div>
            ))}
            <div className="total-hours-mobile">
              <p><strong>Total Hours:</strong> {totalHours.toFixed(2)} hrs</p>
            </div>
          </div>
        </>
      ) : (
        <p>No attendance data available for the selected month.</p>
      )}
    </div>
  );
};

export default WorkingHoursSection;
