import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth0();

  return (
    <nav className="navbar">
      <h1>UserFlow App</h1>
      <ul>
        {isAuthenticated && (
          <li className="dropdown">
            <button className="dropbtn">Welcome, {user.name}</button>
            <div className="dropdown-content">
              <a href="/Profile">Profile</a>
              <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
            </div>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
