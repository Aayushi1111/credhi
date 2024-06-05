import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { loginWithPopup, logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    loginWithPopup({
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    });
  };

  const handleLogout = () => {
    logout({
      returnTo: window.location.origin,
    });
  };

  return (
    <div className="login-container" style={{ textAlign: 'center' }}>
      <h1>Login</h1>
      <button className="login-button" onClick={handleLogin}>
        Login with Auth0
      </button>
      {isAuthenticated ? (
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <p>New User? <a href="/register">Register</a></p>
      )}
    </div>
  );
};

export default Login;
