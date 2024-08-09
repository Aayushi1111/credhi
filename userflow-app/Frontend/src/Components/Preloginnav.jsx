import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

const PreLoginNavbar = () => {
  return (
    <div className="navbar">
      <h1 className="navbar-title">CREDHI</h1>
      <Menu mode="horizontal" className="navbar-menu">
        <Menu.Item key="/login">
          <Link to="/login">Login</Link>
        </Menu.Item>
        <Menu.Item key="/register">
          <Link to="/register">Register</Link>
        </Menu.Item>
        <Menu.Item key="/mission">
          <a href="#mission">Mission</a>
        </Menu.Item>
        <Menu.Item key="/product">
          <a href="#product">Product</a>
        </Menu.Item>
        <Menu.Item key="/contact">
          <a href="#contact">Contact</a>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default PreLoginNavbar;
