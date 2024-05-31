import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Navbar = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <h1>UserFlow App</h1>
      <ul>
        <li><Link to="/register">Register</Link></li>
        <li onClick={handleDashboardClick}>Dashboard</li>
      </ul>
    </nav>
  );
};

export default Navbar;
