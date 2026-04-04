import React from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PredictPage from './pages/PredictPage';
import LeaderboardPage from './pages/LeaderboardPage';
import HomePage from './pages/HomePage';
import AdminResultForm from './pages/AdminResultForm';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/predict');
  };

  return (
    <Routes>
      <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/predict"
        element={
          <ProtectedRoute>
            <PredictPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-results"
        element={
          <ProtectedRoute>
            <AdminResultForm />
          </ProtectedRoute>
        }
      />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
};

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;