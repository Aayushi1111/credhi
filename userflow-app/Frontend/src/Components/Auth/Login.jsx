import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../App.css';

const Login = ({ setIsAuthenticated }) => {
  const { loginWithPopup, logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      console.error('Login error', error);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>
        <p>OR</p>
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
    </div>
  );
};

export default Login;
