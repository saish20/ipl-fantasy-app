import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://ipl-fantasy-app.onrender.com/api/login', {
        username,
        code,
      });
      localStorage.setItem('user_id', res.data.user.id);
      localStorage.setItem('username', res.data.user.username);
      localStorage.setItem('user_type', res.data.user.user_type);
      navigate('/home');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-bg">
        <div className="login-card">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              placeholder="Code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
    </div>
  );
};

export default LoginPage;
