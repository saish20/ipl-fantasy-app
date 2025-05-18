import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Player';

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
          <button onClick={() => navigate('/predict')}>🔮 Make Prediction</button>
          <button onClick={() => navigate('/leaderboard')}>📊 View Leaderboard</button>
        </div>
        <button className="logout-button" onClick={handleLogout}>🚪 Logout</button>
      </div>
    </div>
  );
};

export default HomePage;
