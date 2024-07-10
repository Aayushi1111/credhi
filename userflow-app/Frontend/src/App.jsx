import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Login from './Components/Auth/Login'; // Import the Login component
import Register from './Components/Auth/Register';
import Dashboard from './Components/Dashboard/Dashboard';
import TransactionInitiate from './Components/Dashboard/TransactionInitiate';
import DocumentRetrieve from './Components/Dashboard/DocumentRetrieve';
import Profile from './Components/Profile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="container">
        <Navbar isAuthenticated={isAuthenticated} />
        <Routes>
          {/* Render the Login component first */}
          <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transaction" element={<TransactionInitiate />} />
          <Route path="/document" element={<DocumentRetrieve />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
