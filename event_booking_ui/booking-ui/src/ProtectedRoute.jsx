// components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import apiInstance from './apiInstsance';


const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await apiInstance.get('api/check-session/');
        setIsAuthenticated(res.data.authenticated);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, []);
  if (isAuthenticated === null) {
    return <div>Loading...</div>;  // Or a spinner while checking
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
