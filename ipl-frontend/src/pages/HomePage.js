import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Player';
  const userType = localStorage.getItem('user_type') || 'user';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="home-bg">
      <div className="home-card">
        <h1>Welcome, {username}!</h1>
        <p>Get started with your IPL Fantasy predictions below:</p>
        <div className="home-buttons">
          <button onClick={() => navigate('/predict')}>
            <span role="img" aria-label="crystal ball">🔮</span> Make Prediction
          </button>
          <button onClick={() => navigate('/leaderboard')}>
            <span role="img" aria-label="bar chart">📊</span> View Leaderboard
          </button>
          {userType === 'admin' && (
            <button onClick={() => navigate('/adminresults')}>
              <span role="img" aria-label="admin panel">🛠️</span> Admin Results
            </button>
          )}
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <span role="img" aria-label="door">🚪</span> Logout
        </button>
      </div>
    </div>
  );
};

export default HomePage;
