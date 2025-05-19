import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const userType = localStorage.getItem('user_type');

  if (userType !== 'admin') {
    // Not an admin, redirect to home page
    return <Navigate to="/" />;
  }

  // Admin verified, render the component
  return children;
};

export default AdminRoute;
