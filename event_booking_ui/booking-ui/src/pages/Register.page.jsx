
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
      console.log(!formData.name || !formData.email || !formData.password || !formData.confirmPassword)

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      console.log(error)
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    // Send API call here
    navigate('/calendar');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form className="border p-5 rounded shadow bg-white" onSubmit={handleRegister}>
        <h3 className="text-center mb-4">Register</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-group mb-3">
          <label>Name</label>
          <input type="text" name="name" className="form-control" value={formData?.name} onChange={handleChange} />
        </div>

        <div className="form-group mb-3">
          <label>Email</label>
          <input type="email" name="email" className="form-control" value={formData?.email} onChange={handleChange} required />
        </div>

        <div className="form-group mb-3">
          <label>Password</label>
          <input type="password" name="password" className="form-control" value={formData?.password} onChange={handleChange} required />
        </div>

        <div className="form-group mb-4">
          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" className="form-control" value={formData?.confirmPassword} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn btn-success w-100">Register</button>
        <p className="mt-3 text-center">
          Already have an account? <a href="/">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;