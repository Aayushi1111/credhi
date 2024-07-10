import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../App.css';

const Login = ({ setIsAuthenticated }) => {
  const { loginWithPopup, logout, isAuthenticated: isAuth0Authenticated, user: auth0User } = useAuth0();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsLocalAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuth0Authenticated || isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuth0Authenticated, isAuthenticated, navigate]);

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
    setIsLocalAuthenticated(false);
    setUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { email, password });
      setUser(response.data.user); // Assuming the response contains user data
      setIsLocalAuthenticated(true);
      setIsAuthenticated(true); // Update parent component state if necessary
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      console.error('Login error', error);
      setError('Invalid email or password');
    }
  };

  const currentUser = auth0User || user;

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
          Login with GOOGLE
        </button>
        {isAuth0Authenticated || isAuthenticated ? (
          <div>
            <p>Welcome, {currentUser?.name || currentUser?.email}</p>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <p>New User? <a href="/register">Register</a></p>
        )}
      </div>
    </div>
  );
};

export default Login;
