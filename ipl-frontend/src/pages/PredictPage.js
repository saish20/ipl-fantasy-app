import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PredictPage.css';

const PredictPage = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [firstInningsScore, setFirstInningsScore] = useState('');
  const [matchWinner, setMatchWinner] = useState('');
  const [mom, setMom] = useState('');
  const [message, setMessage] = useState('');
  const [teamOptions, setTeamOptions] = useState([]);
  const [playerOptions, setPlayerOptions] = useState([]);

  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/get-matches')
      .then(res => {
        setMatches(res.data.matches);
      })
      .catch(err => {
        console.error('Failed to load matches:', err);
        setMatches([]);
      });
  }, []);

  const handleMatchChange = async (e) => {
    const matchId = e.target.value;
    setSelectedMatchId(matchId);

    const selectedMatch = matches.find(m => m.id === matchId);
    if (!selectedMatch) return;

    const { team1, team2 } = selectedMatch;
    setTeamOptions([team1, team2]);

    try {
      const res = await axios.get('http://localhost:5000/api/players', {
        params: { team1, team2 }
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
      await axios.post('http://localhost:5000/api/submit-prediction', {
        user_id: userId,
        match_id: selectedMatchId,
        predicted_first_innings_score: Number(firstInningsScore),
        predicted_match_winner: matchWinner,
        predicted_man_of_the_match: mom,
      });

      setMessage('✅ Prediction submitted!');

      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage('❌ Submission failed. Try again.');
    }
  };

  return (
    <div className="predict-bg">
      <div className="predict-card">
        <h2>Submit Your Prediction</h2>
        <form onSubmit={handleSubmit}>
          <label>Select Match:</label>
          <select value={selectedMatchId} onChange={handleMatchChange} required>
            <option value="">--Choose a match--</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.team1} vs {m.team2} ({new Date(m.match_date).toDateString()})
              </option>
            ))}
          </select>

          <label>First Innings Score:</label>
          <input
            type="number"
            value={firstInningsScore}
            onChange={(e) => setFirstInningsScore(e.target.value)}
            required
          />

          <label>Match Winner:</label>
          <select value={matchWinner} onChange={(e) => setMatchWinner(e.target.value)} required>
            <option value="">--Choose team--</option>
            {teamOptions.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>

          <label>Man of the Match:</label>
          <select value={mom} onChange={(e) => setMom(e.target.value)} required>
            <option value="">--Choose player--</option>
            {playerOptions.map((player) => (
              <option key={player} value={player}>{player}</option>
            ))}
          </select>

          <button type="submit">Submit Prediction</button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default PredictPage;
