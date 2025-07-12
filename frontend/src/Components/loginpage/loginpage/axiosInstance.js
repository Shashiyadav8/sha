import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:process.env.REACT_APP_API_BASE_URL, // change in production
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response Interceptor to catch 401/403 globally
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('🔐 Unauthorized! Redirecting to login...');
      // Optionally clear token and redirect
      localStorage.removeItem('token');
      window.location.href = '/'; // or use navigate() in React
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
