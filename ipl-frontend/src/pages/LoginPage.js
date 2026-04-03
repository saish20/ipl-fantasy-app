import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  const userId = localStorage.getItem('user_id');
  if (userId) {
    navigate('/home');
  }
}, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://ipl-fantasy-app.onrender.com/api/login', {
        username,
        password,
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
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
        <p className="auth-switch">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;