import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import { UserContext } from '../../Contexts/UserContext';

const Dashboard = () => {
  const { user } = useContext(UserContext); // Access the user context
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true); // Show content on component mount
  }, []);

  const getUserName = () => {
    if (user?.given_name && user?.family_name) {
      return `${user.given_name} ${user.family_name}`;
    }
    return user?.username || user?.email;
  };
 

  return (
    <div className="dashboard-container">
      <div className={`dashboard-content ${showContent ? 'show' : ''}`}>
        <h1 className="animate-left-to-right">Welcome {getUserName()} to Your Dashboard. What would you like to see today?</h1>
        <div className="dashboard-buttons">
          <Link to="/transaction" className="btn btn-explore">Transaction Initiate</Link>
          <Link to="/document" className="btn btn-learn-more">Document Retrieve</Link>
        </div>
      </div>
      <div className="dashboard-image">
        <img src="/img.jpeg" alt="Financial Analysis" />
      </div>
    </div>
  );
};

export default Dashboard;