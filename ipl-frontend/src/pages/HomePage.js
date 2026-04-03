import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Player';
  const userType = localStorage.getItem('user_type') || 'user';

  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [predictionError, setPredictionError] = useState('');
  const [predictionsVisibleForAll, setPredictionsVisibleForAll] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const fetchPredictionsVisibility = async () => {
    try {
      const res = await axios.get(
        'https://ipl-fantasy-app.onrender.com/api/predictions-visibility'
      );

      setPredictionsVisibleForAll(res.data.showPredictionsGlobal);
    } catch (err) {
      console.error('Failed to fetch predictions visibility:', err);
    }
  };

  useEffect(() => {
    fetchPredictionsVisibility();
  }, []);

  const updatePredictionsVisibility = async (visible) => {
    try {
      const res = await axios.post(
        'https://ipl-fantasy-app.onrender.com/api/set-predictions-visibility',
        { visible }
      );

      setPredictionsVisibleForAll(res.data.showPredictionsGlobal);
    } catch (err) {
      console.error('Failed to update predictions visibility:', err);
      setPredictionError('Failed to update prediction visibility.');
    }
  };

  const handleDisplayPredictions = async () => {
    try {
      setLoadingPredictions(true);
      setPredictionError('');

      const res = await axios.get(
        'https://ipl-fantasy-app.onrender.com/api/get-all-predictions'
      );

      setPredictions(res.data.predictions || []);
      setShowPredictions(true);
    } catch (err) {
      console.error(err);
      setPredictionError('Failed to load predictions.');
    } finally {
      setLoadingPredictions(false);
    }
  };

  useEffect(() => {
    if (predictionsVisibleForAll) {
      handleDisplayPredictions();
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  }, [predictionsVisibleForAll]);

  return (
    <div className="home-bg">
      <div className="home-card home-card-wide">
        <h1>Welcome, {username}!</h1>
        <p>Get started with your IPL Fantasy predictions below:</p>

        <div className="home-buttons">
          <button onClick={() => navigate('/predict')}>🔮 Make Prediction</button>
          <button onClick={() => navigate('/leaderboard')}>📊 View Leaderboard</button>

          {userType === 'admin' && (
            <>
              <button onClick={() => navigate('/admin-results')}>
                🛠️ Update Match Results
              </button>

              <div className="prediction-visibility-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={predictionsVisibleForAll}
                    onChange={(e) => updatePredictionsVisibility(e.target.checked)}
                  />
                  Display predictions for everyone
                </label>
              </div>
            </>
          )}
        </div>

        {loadingPredictions && (
          <p className="predictions-message">Loading predictions...</p>
        )}

        {predictionError && (
          <p className="predictions-message error-message">{predictionError}</p>
        )}

        {predictionsVisibleForAll && showPredictions && (
          <div className="predictions-section">
            <h2>Submitted Predictions</h2>

            {predictions.length === 0 ? (
              <p className="predictions-message">No predictions found.</p>
            ) : (
              <div className="predictions-table-wrapper">
                <table className="predictions-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Predicted Winner</th>
                      <th>First Innings Score</th>
                      <th>Man of the Match</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((prediction, index) => (
                      <tr key={prediction.id || index}>
                        <td>{prediction.username || prediction.user_name || '—'}</td>
                        <td>{prediction.predicted_winner || prediction.match_winner || '—'}</td>
                        <td>{prediction.predicted_score || prediction.first_innings_score || '—'}</td>
                        <td>{prediction.predicted_mom || prediction.man_of_the_match || '—'}</td>
                        <td>
                          {prediction.submitted_at
                            ? new Date(prediction.submitted_at).toLocaleString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <button className="logout-button" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default HomePage;