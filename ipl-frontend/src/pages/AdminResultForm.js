import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminResultForm.css';
import { useNavigate } from 'react-router-dom';



const AdminResultForm = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [score, setScore] = useState('');
  const [winner, setWinner] = useState('');
  const [mom, setMom] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    axios.get('https://ipl-fantasy-app.onrender.com/api/get-all-matches')
      .then(res => setMatches(res.data.matches))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://ipl-fantasy-app.onrender.com/api/update-results', {
        schedule_id: selectedMatchId,
        actual_first_innings_score: Number(score),
        actual_match_winner: winner,
        actual_mom: mom
      });
      setMessage('Match result saved!');
      navigate('/home'); 
    } catch (err) {
      setMessage('Failed to save result.');
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Update Match Result</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Match:</label>
          <select value={selectedMatchId} onChange={e => setSelectedMatchId(e.target.value)} required>
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
          <input type="number" value={score} onChange={e => setScore(e.target.value)} required />
        </div>
        <div>
          <label>Match Winner:</label>
          <input type="text" value={winner} onChange={e => setWinner(e.target.value)} required />
        </div>
        <div>
          <label>Man of the Match:</label>
          <input type="text" value={mom} onChange={e => setMom(e.target.value)} required />
        </div>
        <button type="submit">Save Result</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminResultForm;
