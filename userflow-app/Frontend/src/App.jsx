import React, { useState, useEffect } from 'react';
import './App.css';
import './Components/Home.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import PostLoginNavbar from './Components/Postloginnav';
import PreLoginNavbar from './Components/Preloginnav'; // Assuming PreLoginNavbar is imported correctly
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';
import Dashboard from './Components/Dashboard/Dashboard';
import TransactionInitiate from './Components/Dashboard/TransactionInitiate';
import DocumentRetrieve from './Components/Dashboard/DocumentRetrieve';
import Profile from './Components/Profile';
import Home from './Components/Home';
import ScrollToTop from './Components/ScrollToTop';
import { UserProvider } from './Contexts/UserContext';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <UserProvider>
      <Router>
        <div className="container">
          <NavbarSwitcher isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
          <RoutesWithAnimation>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transaction" element={<TransactionInitiate />} />
            <Route path="/document" element={<DocumentRetrieve />} />
            <Route path="/profile" element={<Profile />} />
          </RoutesWithAnimation>
          <ScrollToTop />
        </div>
      </Router>
    </UserProvider>
  );
};

const NavbarSwitcher = ({ isAuthenticated, setIsAuthenticated }) => {
  const location = useLocation();

  // Determine if the current path is for login or register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthenticated) {
    // Show PostLoginNavbar on authenticated routes
    return <PostLoginNavbar setIsAuthenticated={setIsAuthenticated} />;
  } else {
    // Show PreLoginNavbar on unauthenticated routes only for home, login, and register pages
    return isAuthPage || location.pathname === '/' ? <PreLoginNavbar /> : null;
  }
};

const RoutesWithAnimation = ({ children }) => {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="page" timeout={300}>
        <Routes location={location}>{children}</Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default App;
