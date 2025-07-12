import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ProductivityChart.css';

// Register ChartJS components
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const ProductivityChart = () => {
  const [data, setData] = useState({
    tasksCompleted: 0,
    hoursWorked: 0,
    leavesTaken: 0,
  });

  const API_BASE = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProductivity = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/employees/productivity`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch productivity data');
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('❌ Failed to fetch productivity data:', err);
      }
    };

    fetchProductivity();
  }, [API_BASE, token]);

  const chartData = {
    labels: ['Tasks Completed', 'Hours Worked', 'Leaves Taken'],
    datasets: [
      {
        label: 'Employee Productivity',
        data: [data.tasksCompleted, data.hoursWorked, data.leavesTaken],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF5722'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '📊 Productivity Overview',
        font: { size: 16 },
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
    <div className="productivity-chart-container">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default ProductivityChart;
