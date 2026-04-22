import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminResultForm.css';

const AdminResultForm = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [score, setScore] = useState('');
  const [winner, setWinner] = useState('');
  const [mom, setMom] = useState('');
  const [message, setMessage] = useState('');
  const [teamOptions, setTeamOptions] = useState([]);
  const [playerOptions, setPlayerOptions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('https://ipl-fantasy-app.onrender.com/api/get-matches')
      .then((res) => {
        setMatches(res.data.matches || []);
      })
      .catch((err) => {
        console.error('Failed to load matches:', err);
        setMatches([]);
      });
  }, []);

  const handleMatchChange = async (e) => {
    const matchId = e.target.value;
    setSelectedMatchId(matchId);

    setScore('');
    setWinner('');
    setMom('');
    setMessage('');
    setTeamOptions([]);
    setPlayerOptions([]);

    const selectedMatch = matches.find((m) => m.id === matchId);
    if (!selectedMatch) return;

    const { team1, team2 } = selectedMatch;
    setTeamOptions([team1, team2]);

    try {
      const res = await axios.get('https://ipl-fantasy-app.onrender.com/api/players', {
        params: { team1, team2 },
      });
      setPlayerOptions(res.data.players || []);
    } catch (err) {
      console.error('Failed to load players:', err);
      setPlayerOptions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('https://ipl-fantasy-app.onrender.com/api/update-results', {
        schedule_id: selectedMatchId,
        actual_first_innings_score: Number(score),
        actual_match_winner: winner,
        actual_mom: mom,
      });

      setMessage('Match result saved!');
    } catch (err) {
      console.error('Failed to save result:', err);
      setMessage('Failed to save result.');
    }
  };

  return (
    <div className="admin-bg">
      <div className="admin-card">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/home')}
        >
          ← Back to Home
        </button>

        <h2>Update Match Result</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Match:</label>
            <select
              value={selectedMatchId}
              onChange={handleMatchChange}
              required
            >
              <option value="">--Select--</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.team1} vs {m.team2} ({new Date(m.match_date).toDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Actual First Innings Score:</label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Match Winner:</label>
            <select
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              required
              disabled={!selectedMatchId}
            >
              <option value="">--Choose team--</option>
              {teamOptions.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Man of the Match:</label>
            <select
              value={mom}
              onChange={(e) => setMom(e.target.value)}
              required
              disabled={!selectedMatchId}
            >
              <option value="">--Choose player--</option>
              {playerOptions.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </select>
          </div>

          <button type="submit">Save Result</button>
        </form>

        {message && <p className="admin-message">{message}</p>}
      </div>
    </div>
  );
};

export default AdminResultForm;