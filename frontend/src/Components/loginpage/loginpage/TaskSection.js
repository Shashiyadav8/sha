import React, { useEffect, useState, useCallback } from 'react';
import './TaskSection.css';

const TaskSection = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [message, setMessage] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_URL;

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    const fetchProfileAndTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');
        const profile = await res.json();
        setEmployeeId(profile.employee_id);
      } catch (err) {
        console.error('Failed to load profile', err);
      }

      fetchTasks();
    };

    fetchProfileAndTasks();
  }, [fetchTasks, API_BASE, token]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.description) {
      setMessage('❗ Title and Description are required');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newTask,
          employee_id: employeeId,
        }),
      });

      if (!res.ok) throw new Error('Failed to add task');
      setMessage('✅ Task added successfully');
      setNewTask({ title: '', description: '' });
      fetchTasks();
    } catch (err) {
      console.error('Add task error:', err);
      setMessage('❌ Failed to add task');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update task');
      fetchTasks();
    } catch (err) {
      console.error('Update task error:', err);
    }
  };

  return (
    <div className="task-section">
      <h3>📝 Task Tracking</h3>

      {message && <p className="task-message">{message}</p>}

      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          required
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Desktop Table */}
      <table className="task-table desktop-only">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Change</th>
            <th>Created</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{task.status}</td>
              <td>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
              <td>{new Date(task.created_at).toLocaleString()}</td>
              <td>{task.completed_at ? new Date(task.completed_at).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="task-cards mobile-only">
        {tasks.map((task) => (
          <div key={task._id} className="task-card">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <p>
              <strong>Change:</strong>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </p>
            <p><strong>Created:</strong> {new Date(task.created_at).toLocaleString()}</p>
            <p><strong>Completed:</strong> {task.completed_at ? new Date(task.completed_at).toLocaleString() : '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskSection;
