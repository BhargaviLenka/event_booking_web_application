import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import useAxios from "../useAxios";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
});
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [response, error, loading, fetchData] = useAxios();

  const handleLogin = (e) => {
    e.preventDefault();
    // fetchData({ method: 'GET', url: '/api/get-data' });
    navigate('/calendar');
  };

//   useEffect(() => {
//     fetchData({ method: 'GET', url: '/api/get-data' });
//     }, []);

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 ">
      <form className="border p-5 rounded shadow  bg-white" onSubmit={handleLogin}>
        <h3 className="text-center mb-4">Login</h3>
        <div className="form-group mb-3">
          <label>Email</label>
          <input type="email" className="form-control" value={loginData?.email} onChange={(e) => setLoginData({...Login,'email':e.target.value})} required />
        </div>
        <div className="form-group mb-4">
          <label>Password</label>
          <input type="password" className="form-control" value={loginData?.password} onChange={(e) => setLoginData({...Login,'password':e.target.value})} required />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
        <p className="mt-3 text-center">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
};

export default Login;