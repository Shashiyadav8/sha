import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [tab, setTab] = useState('employee');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_URL;

  const handleLogin = async () => {
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { token, user } = data;

      if (!token || !user) {
        setError('Invalid credentials or missing token.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>ISAR</h1>
        <h2>Employee Management Login</h2>

        <div className="tab-buttons">
          <button
            className={tab === 'employee' ? 'active' : ''}
            onClick={() => setTab('employee')}
          >
            Employee
          </button>
          <button
            className={tab === 'admin' ? 'active' : ''}
            onClick={() => setTab('admin')}
          >
            Admin
          </button>
        </div>

        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
