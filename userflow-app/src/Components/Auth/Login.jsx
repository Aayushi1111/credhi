import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform login logic here (e.g., call API, validate credentials)
    setIsAuthenticated(true); // Set authentication status to true
    navigate('/dashboard'); // Redirect to dashboard after successful login
  };

  return (
    <div className="form-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" className="btn btn-primary btn-block">
          Login
        </button>
      </form>
      <p>
        New user? <a href="/Register">Register here</a>
      </p>
    </div>
  );
};

export default Login;
