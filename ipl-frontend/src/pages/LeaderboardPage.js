import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://ipl-fantasy-app.onrender.com/api/leaderboard')
      .then(res => setData(res.data.leaderboard))
      .catch(err => console.error('Failed to fetch leaderboard:', err));
  }, []);

  const renderTable = (label, key) => {
    const sorted = [...data].sort((a, b) => b[key] - a[key]);
    return (
      <div className="leaderboard-section">
        <h3>{label}</h3>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>{label}</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, index) => (
              <tr key={row.username}>
                <td>{row.username}</td>
                <td>{row[key]}</td>
                <td>{index + 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const addTotal = row =>
    row.fis_points + row.mw_points + row.mom_points;

  const renderOverallTable = () => {
    const ranked = [...data]
      .map(row => ({ ...row, total: addTotal(row) }))
      .sort((a, b) => b.total - a.total);

    return (
      <div className="leaderboard-section">
        <h2>🏆 Current Standings</h2>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Total</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((row, i) => (
              <tr key={row.username}>
                <td>{row.username}</td>
                <td>{row.total}</td>
                <td>{i + 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="leaderboard-container">
      <button className="back-button" onClick={() => navigate('/home')}>
        ⬅ Back to Home
      </button>
      {renderOverallTable()}
      <div className="leaderboard-grid">
        {renderTable('Match Winner', 'mw_points')}
        {renderTable('First Innings Score', 'fis_points')}
        {renderTable('MOM', 'mom_points')}
      </div>
    </div>
  );
};

export default LeaderboardPage;
