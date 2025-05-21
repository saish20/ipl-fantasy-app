import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Player';
  const userType = localStorage.getItem('user_type') || 'user';

  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [predictions, setPredictions] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    if (userType === 'admin') {
      axios.get('https://ipl-fantasy-app.onrender.com/api/get-all-matches')
        .then(res => setMatches(res.data.matches))
        .catch(err => console.error(err));
    }
  }, [userType]);

  useEffect(() => {
    if (selectedMatchId) {
      axios.get(`https://ipl-fantasy-app.onrender.com/api/get-predictions?match_id=${selectedMatchId}`)
        .then(res => {
          console.log('Fetched predictions:', res.data);
          setPredictions(res.data.predictions);
        })
        .catch(err => console.error(err));
    }
  }, [selectedMatchId]);

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
            <button onClick={() => navigate('/admin/results')}>
              <span role="img" aria-label="admin panel">🛠️</span> Admin Results
            </button>
          )}
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <span role="img" aria-label="door">🚪</span> Logout
        </button>
      </div>

      {/* 🔥 Move this OUTSIDE .home-card */}
      {userType === 'admin' && (
        <div className="admin-section">
          <h3>Display Predictions</h3>
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
          >
            <option value="">-- Select Match --</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.team1} vs {match.team2} ({new Date(match.match_date).toDateString()})
              </option>
            ))}
          </select>

          {predictions.length > 0 && (
            <table className="predictions-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Predicted Winner</th>
                  <th>Score</th>
                  <th>MOM</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p, i) => (
                  <tr key={i}>
                    <td>{p.username}</td>
                    <td>{p.predicted_winner}</td>
                    <td>{p.predicted_score}</td>
                    <td>{p.predicted_mom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
