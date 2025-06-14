import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import useAxios from "../useAxios"; 

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const [sessionResponse, , sessionLoading, fetchSession] = useAxios();

  const [loginResponse, loginError, loginLoading, fetchLogin] = useAxios();

  useEffect(() => {
    fetchSession({ method: 'GET', url: '/api/check-session/' });
  }, []);

  useEffect(() => {
    if (sessionResponse?.authenticated) {
      navigate('/admin');
    }
  }, [sessionResponse, navigate]);

  useEffect(() => {
    if (loginResponse?.authenticated) {
      navigate('/admin');
    }
  }, [loginResponse, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    await fetchLogin({
      method: 'POST',
      url: '/api/login/',
      data: loginData,
    });
  };

  // Show session loading before even rendering form
  if (sessionLoading) {
    return <div className="vh-100 d-flex justify-content-center align-items-center">Checking session...</div>;
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form className="border p-5 rounded shadow bg-white" onSubmit={handleLogin}>
        <h3 className="text-center mb-4">Login</h3>

        <div className="form-group mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group mb-4">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loginLoading}>
          {loginLoading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-3 text-center">
          Don't have an account? <a href="/register">Register</a>
        </p>

        {loginError && (
          <div className="alert alert-danger mt-3">
            Login failed. Please check your credentials.
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
