import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('https://ipl-fantasy-app.onrender.com/api/leaderboard')
      .then((res) => setData(res.data.leaderboard || []))
      .catch((err) => console.error('Failed to fetch leaderboard:', err));
  }, []);

  const rankedOverall = useMemo(() => {
    return [...data]
      .map((row) => ({
        ...row,
        total:
          (row.fis_points || 0) +
          (row.mw_points || 0) +
          (row.mom_points || 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  const mwRanked = useMemo(() => {
    return [...data].sort((a, b) => (b.mw_points || 0) - (a.mw_points || 0));
  }, [data]);

  const fisRanked = useMemo(() => {
    return [...data].sort((a, b) => (b.fis_points || 0) - (a.fis_points || 0));
  }, [data]);

  const momRanked = useMemo(() => {
    return [...data].sort((a, b) => (b.mom_points || 0) - (a.mom_points || 0));
  }, [data]);

  const summaryCards = useMemo(() => {
    const overallLeader = rankedOverall[0];
    const bestMatchWinner = mwRanked[0];
    const bestScorePredictor = fisRanked[0];

    return [
      {
        label: 'Overall Leader',
        name: overallLeader?.username || '-',
        value: `${overallLeader?.total ?? 0} pts`,
      },
      {
        label: 'Best Match Winner',
        name: bestMatchWinner?.username || '-',
        value: `${bestMatchWinner?.mw_points ?? 0} pts`,
      },
      {
        label: 'Best Score Predictor',
        name: bestScorePredictor?.username || '-',
        value: `${bestScorePredictor?.fis_points ?? 0} pts`,
      },
    ];
  }, [rankedOverall, mwRanked, fisRanked]);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-shell">
        <div className="leaderboard-topbar">
          <button className="back-button" onClick={() => navigate('/home')}>
            ← Back to Home
          </button>
        </div>

        <div className="page-header">
          <p className="page-eyebrow">IPL Fantasy</p>
          <h1>Leaderboard</h1>
          <p className="page-subtitle">
            Track standings and prediction performance across categories
          </p>
        </div>

        <div className="summary-grid">
          {summaryCards.map((card) => (
            <div className="summary-card" key={card.label}>
              <span className="summary-label">{card.label}</span>
              <h3>{card.name}</h3>
              <p>{card.value}</p>
            </div>
          ))}
        </div>

        <section className="panel">
          <div className="panel-header">
            <h2>Current Standings</h2>
          </div>

          <div className="table-wrap">
            <table className="modern-table overall-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {rankedOverall.map((row, index) => (
                  <tr key={row.username} className={index < 3 ? 'top-rank-row' : ''}>
                    <td className="rank-cell">
                      <span className={`rank-badge rank-${index + 1}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="player-cell">{row.username}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Prediction Breakdown</h2>
          </div>

          <div className="breakdown-grid">
            <div className="breakdown-column">
              <div className="breakdown-title">Match Winner</div>
              {mwRanked.map((row, index) => (
                <div className="breakdown-row" key={`mw-${row.username}`}>
                  <span className="breakdown-name">
                    {index + 1}. {row.username}
                  </span>
                  <span className="breakdown-score">{row.mw_points || 0}</span>
                </div>
              ))}
            </div>

            <div className="breakdown-column">
              <div className="breakdown-title">First Innings Score</div>
              {fisRanked.map((row, index) => (
                <div className="breakdown-row" key={`fis-${row.username}`}>
                  <span className="breakdown-name">
                    {index + 1}. {row.username}
                  </span>
                  <span className="breakdown-score">{row.fis_points || 0}</span>
                </div>
              ))}
            </div>

            <div className="breakdown-column">
              <div className="breakdown-title">MOM</div>
              {momRanked.map((row, index) => (
                <div className="breakdown-row" key={`mom-${row.username}`}>
                  <span className="breakdown-name">
                    {index + 1}. {row.username}
                  </span>
                  <span className="breakdown-score">{row.mom_points || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LeaderboardPage;