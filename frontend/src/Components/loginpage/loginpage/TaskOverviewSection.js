import React, { useEffect, useState, useCallback } from 'react';
import './TaskOverviewSection.css';

const TaskOverviewSection = () => {
  const [overview, setOverview] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newTask, setNewTask] = useState({
    employee_id: '',
    title: '',
    description: ''
  });

  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_URL;

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch overview');
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      console.error('Failed to fetch task overview:', err);
    }
  }, [API_BASE, token]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    fetchOverview();
    fetchEmployees();
  }, [fetchOverview, fetchEmployees]);

  const handleTaskAssign = async () => {
    const { employee_id, title, description } = newTask;

    if (!employee_id || !title || !description) {
      alert('❗ Please fill all fields to assign a task.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/tasks/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employee_id, title, description }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to assign task');
      }

      alert('✅ Task assigned successfully');
      setNewTask({ employee_id: '', title: '', description: '' });
      fetchOverview();
    } catch (err) {
      console.error('Task assign error:', err);
      alert(err.message || '❌ Failed to assign task');
    }
  };

  return (
    <div className="task-overview-section">
      <h3>🧾 Task Overview per Employee</h3>

      <div className="task-form">
        <h4>📌 Assign Task</h4>

        <select
          value={newTask.employee_id}
          onChange={(e) => setNewTask({ ...newTask, employee_id: e.target.value })}
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id || emp._id} value={emp.employee_id}>
              {emp.name} ({emp.employee_id})
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />

        <textarea
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />

        <button onClick={handleTaskAssign}>Assign Task</button>
      </div>

      {overview.length === 0 ? (
        <p>No task data available.</p>
      ) : (
        <div className="responsive-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Total</th>
                <th>Completed</th>
                <th>In Progress</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {overview.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>{emp.employee_name} ({emp.employee_id})</td>
                  <td>{emp.total_tasks}</td>
                  <td>{emp.completed_tasks}</td>
                  <td>{emp.in_progress_tasks}</td>
                  <td>{emp.pending_tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskOverviewSection;
