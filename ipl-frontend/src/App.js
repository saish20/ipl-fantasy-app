import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PredictPage from './pages/PredictPage';
import LeaderboardPage from './pages/LeaderboardPage';
import HomePage from './pages/HomePage';
import AdminResultForm from './pages/AdminResultForm';

const AppRoutes = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/predict');
  };

  return (
    <Routes>
      <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/predict" element={<PredictPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/admin/results" element={<AdminResultForm />} />
    </Routes>
  );
};

const App = () => <AppRoutes />;

export default App;
