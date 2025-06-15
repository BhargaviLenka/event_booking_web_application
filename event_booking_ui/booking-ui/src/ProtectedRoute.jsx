import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setUser } from './store/authSlice';
import useAxios from './useAxios';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [response, error, loading, fetchData] = useAxios();

  useEffect(() => {
    if (!sessionChecked) {
      fetchData({ method: 'GET', url: '/api/check-session/' });
    }
  }, [sessionChecked]);

  useEffect(() => {
    if (response?.authenticated) {
      dispatch(setUser(response));
      setSessionChecked(true);
    } else if (error) {
      dispatch(clearUser());
      setSessionChecked(true);
    }
  }, [response, error, dispatch]);

  if (loading || !sessionChecked) {
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;