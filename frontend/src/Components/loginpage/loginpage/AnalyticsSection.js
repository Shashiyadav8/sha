// src/Components/admin/AnalyticsSection.js
import React, { useEffect, useState } from 'react';
import './AnalyticsSection.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState(null);
  const [filteredStats, setFilteredStats] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setAnalytics(data);
        setFilteredStats(data.employeeStats || []);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      }
    };

    fetchAnalytics();
  }, [API_BASE, token]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedEmployee(value);

    if (!value) {
      setFilteredStats(analytics.employeeStats);
    } else {
      const filtered = analytics.employeeStats.filter((emp) =>
        emp.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStats(filtered);
    }
  };

  if (!analytics) return <p>Loading analytics...</p>;

  const chartData = {
    labels: filteredStats.map((emp) => emp.name),
    datasets: [
      {
        label: 'Avg Hours',
        data: filteredStats.map((emp) =>
          Number(emp.avg_hours || 0).toFixed(2)
        ),
        backgroundColor: '#007bff',
      },
      {
        label: 'Leaves',
        data: filteredStats.map((emp) => emp.total_leaves || 0),
        backgroundColor: '#dc3545',
      },
      {
        label: 'Tasks',
        data: filteredStats.map((emp) => emp.total_tasks || 0),
        backgroundColor: '#ffc107',
      },
      {
        label: 'Completed Tasks',
        data: filteredStats.map((emp) => emp.completed_tasks || 0),
        backgroundColor: '#28a745',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Employee Analytics Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="analytics-section">
      <h3>📊 Admin Analytics Report</h3>

      <div className="filter-container">
        <input
          type="text"
          placeholder="🔍 Filter by employee name..."
          value={selectedEmployee}
          onChange={handleFilterChange}
        />
      </div>

      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AnalyticsSection;
