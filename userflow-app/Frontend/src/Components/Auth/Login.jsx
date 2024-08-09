import React, { useState, useEffect, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../App.css';
import { UserContext } from '../../Contexts/UserContext';
import jwt_decode from 'jwt-decode';

const Login = ({ setIsAuthenticated }) => {
  const { loginWithPopup, logout, isAuthenticated: isAuth0Authenticated, user: auth0User } = useAuth0();
  const navigate = useNavigate();
  const { user: localUser, setUser } = useContext(UserContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLocalAuthenticated, setIsLocalAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          handleLogout();
        } else {
          setIsLocalAuthenticated(true);
          setIsAuthenticated(true);
          setUser(decodedToken);
        }
      } catch (error) {
        console.error('Invalid token error', error);
        handleLogout();
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [setIsAuthenticated, setUser]);

  useEffect(() => {
    if (isAuth0Authenticated || isLocalAuthenticated) {
      setIsAuthenticated(true);
      navigate('/dashboard', { replace: true });
    } else {
      setIsAuthenticated(false);
    }
  }, [isAuth0Authenticated, isLocalAuthenticated, navigate, setIsAuthenticated]);

  const handleLogin = () => {
    loginWithPopup({
      authorizationParams: {
        redirect_uri: window.location.origin,
        connection: 'google-oauth2'
      },
    });
  };

  const handleLogout = () => {
    logout({
      returnTo: window.location.origin,
    });
    localStorage.removeItem('token');
    setIsLocalAuthenticated(false);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { email, password });
      const { token } = response.data;
      
      // Ensure the token is valid
      if (!token) {
        throw new Error('No token provided');
      }

      // Decode and store the token
      const decodedUser = jwt_decode(token);
      localStorage.setItem('token', token);
      setUser(decodedUser);
      setIsLocalAuthenticated(true);
      setIsAuthenticated(true);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Login error', error);
      setError('Invalid email or password');
    }
  };

  const currentUser = auth0User || localUser;

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
        <div className="separator">
          <span className="separator-text">OR</span>
        </div>
        <button className="login-button" onClick={handleLogin}>
          Login with GOOGLE
        </button>
        {isAuth0Authenticated || isLocalAuthenticated ? (
          <div className="user-info">
            <p>Welcome, {currentUser?.given_name || currentUser?.username || currentUser?.email}</p>
            <p className="logout-link" onClick={handleLogout} style={{ cursor: 'pointer', color: 'blue' }}>
              Logout
            </p>
          </div>
        ) : (
          <p>New User? <a href="/register">Register</a></p>
        )}
      </div>
    </div>
  );
};

export default Login;
