import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';

const Dashboard = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true); // Show content on component mount
  }, []);

  return (
    <div className="dashboard-container">
      <div className={`dashboard-content ${showContent ? 'show' : ''}`}>
        <h1 className="animate-left-to-right">Welcome to Your Dashboard. What would you like to see today?</h1>
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
