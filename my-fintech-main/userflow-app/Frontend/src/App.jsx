import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';
import Dashboard from './Components/Dashboard/Dashboard';
import TransactionInitiate from './Components/Dashboard/TransactionInitiate';
import DocumentRetrieve from './Components/Dashboard/DocumentRetrieve';
import Profile from './Components/Profile';
import { UserProvider } from './Contexts/UserContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <UserProvider>
      <Router>
        <div className="container">
          <Navbar isAuthenticated={isAuthenticated} />
          <Routes>
            <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transaction" element={<TransactionInitiate />} />
            <Route path="/document" element={<DocumentRetrieve />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
