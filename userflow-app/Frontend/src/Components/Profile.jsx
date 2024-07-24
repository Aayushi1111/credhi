import React, { useContext } from 'react';
import { UserContext } from '../Contexts/UserContext';
import '../App.css';

const Profile = ({ coins }) => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img src="https://via.placeholder.com/150" alt="Profile" className="profile-img" />
        <h2>User Profile</h2>
        <div className="profile-details">
          <p><strong>Name:</strong> {user.name || 'N/A'}</p>
          <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
          <p><strong>Coins:</strong> {coins}</p> {/* Display user's coins */}
        </div>
      </div>
    </div>
  );
};

export default Profile;
