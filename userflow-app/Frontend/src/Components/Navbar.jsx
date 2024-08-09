import React from 'react';
import PreLoginNavbar from './Preloginnav';
import PostLoginNavbar from './Postloginnav';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  console.log('Navbar isAuthenticated:', isAuthenticated);
  return isAuthenticated ? <PostLoginNavbar setIsAuthenticated={setIsAuthenticated} /> : <PreLoginNavbar />;
};

export default Navbar;
