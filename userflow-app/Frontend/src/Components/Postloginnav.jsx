import React, { useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Contexts/UserContext';
import jwt_decode from 'jwt-decode';

const Postloginnav = ({ setIsAuthenticated }) => {
  const { user: auth0User, isAuthenticated: isAuth0Authenticated, logout: auth0Logout } = useAuth0();
  const { user: localUser, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwt_decode(token);
          console.log('Decoded Token:', decodedToken);
          if (decodedToken.exp * 1000 < Date.now()) {
            handleLogout();
          } else {
            setUser(decodedToken);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    };

    checkTokenExpiration();
  }, [setUser, setIsAuthenticated]);

  const handleLogout = () => {
    if (isAuth0Authenticated) {
      auth0Logout({ returnTo: window.location.origin });
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/', { replace: true });
    }
  };

  const isAuthenticated = isAuth0Authenticated || localUser !== null;
  const currentUser = auth0User || localUser;

  console.log('isAuthenticated:', isAuthenticated);
  console.log('Current User:', currentUser);

  return (
    <nav className="navbar">
      <h1>CREDHI</h1>
      <ul>
        {isAuthenticated && (
          <li className="dropdown">
            <button className="dropbtn">Welcome, {currentUser?.name || currentUser?.email}</button>
            <div className="dropdown-content">
              <a href="/profile">Profile</a>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Postloginnav;
