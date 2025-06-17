import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setUser } from './store/authSlice';
import useAxios from './useAxios';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [response, error, loading, fetchData] = useAxios();

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      fetchData({ method: 'GET', url: '/api/check-session/' });
    }
  }, []);

  useEffect(() => {
    if (response?.authenticated) {
      dispatch(setUser(response));
    } else if (error && !loading) {
      dispatch(clearUser());
    }
  }, [response, error, loading, dispatch]);

  if (loading || (!auth.isAuthenticated && !error && !response)) {
    return <div>Checking session...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
