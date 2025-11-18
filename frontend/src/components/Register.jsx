import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onRegisterSuccess, showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      
      if (response.data.success) {
        onRegisterSuccess(response.data.data);
        // Clear form
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Registration failed. Please try again.', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          required
          minLength="6"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register Now'}
      </button>
    </form>
  );
};

export default Register;