import React, { useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Contexts/UserContext';
import {jwtDecode} from 'jwt-decode';
import '../App.css';

const Navbar = () => {
  const { user: auth0User, isAuthenticated: isAuth0Authenticated, logout: auth0Logout } = useAuth0();
  const { user: localUser, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    if (isAuth0Authenticated) {
      auth0Logout({ returnTo: window.location.origin });
    } else {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/', { replace: true });
    }
  };

  const isAuthenticated = isAuth0Authenticated || localUser !== null;
  const currentUser = auth0User || localUser;

  console.log('Current User:', currentUser);

  return (
    <nav className="navbar">
      <h1>UserFlow App</h1>
      <ul>
        {isAuthenticated && (
          <li className="dropdown">
            <button className="dropbtn">Welcome, {currentUser?.name || currentUser?.email}</button>
            <div className="dropdown-content">
              <a href="/Profile">Profile</a>
              <button onClick={handleLogout}><h4>Logout</h4></button>
            </div>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
