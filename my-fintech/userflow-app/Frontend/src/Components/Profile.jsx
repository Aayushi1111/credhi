import React from 'react';
import '../App.css';

const Profile = ({ coins }) => {
  // Sample user data; replace with actual user data from your context or state
  const user = {
    name: 'Aayushi',
    email: 'aayushi@example.com',
    phone: '123-456-7890'
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img src="https://via.placeholder.com/150" alt="Profile" className="profile-img" />
        <h2>User Profile</h2>
        <div className="profile-details">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Coins:</strong> {coins}</p> {/* Display user's coins */}
        </div>
      </div>
    </div>
  );
};

export default Profile;
