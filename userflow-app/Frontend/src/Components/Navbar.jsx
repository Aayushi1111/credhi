import '../App.css';
import React, { useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Contexts/UserContext';
import jwt_decode from 'jwt-decode';

const Navbar = () => {
  const { user: auth0User, isAuthenticated: isAuth0Authenticated, logout: auth0Logout, getAccessTokenSilently } = useAuth0();
  const { user: localUser, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwt_decode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            handleLogout();
          } else {
            const user = jwt_decode(token);
            setUser(user);
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    };

    checkTokenExpiration();
  }, [setUser]);

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
