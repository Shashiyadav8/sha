import { useEffect } from "react";
import { Routes, Route } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoginPage from './Components/loginpage/loginpage/LoginPage'
import AdminDashboard from './Components/loginpage/loginpage/AdminDashboard';
import EmployeeDashboard from './Components/loginpage/loginpage/EmployeeDashboard';
import './index.css';

function App() {
  useEffect(() => {
    document.title = "INDIAN SCIENTIFIC AEROSPACE AND ROBOTICS";
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <>
      

      <Routes>
         <Route path="/" element={<LoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
         <Route path="*" element={<LoginPage />} />

      </Routes>

      
    </>
  );
}

export default App;
