// src/components/Auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', formData);
      const response = await authService.login(formData);
      console.log('Login response received:', response);
      
      // Check localStorage after login
      console.log('Token in localStorage:', localStorage.getItem('token'));
      console.log('User in localStorage:', localStorage.getItem('user'));
      
      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      }
      
      // Redirect to books page after successful login
      navigate('/books');
    } catch (err) {
      console.error('Login failed:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if already logged in
  if (authService.isAuthenticated()) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body text-center">
                <h3 className="card-title mb-4">Already Logged In</h3>
                <div className="alert alert-success">
                  You are already logged in as <strong>{authService.getCurrentUser()?.username}</strong>
                </div>
                <div className="d-grid gap-2">
                  <Link to="/books" className="btn btn-primary">
                    Go to Books
                  </Link>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      authService.logout();
                      window.location.reload();
                    }}
                  >
                    Logout and Login as Different User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Login</h3>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  <Link to="/" className="text-decoration-none">Back to Home</Link>
                </small>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>Test Credentials:</strong><br/>
                  <strong>Username:</strong> admin<br/>
                  <strong>Password:</strong> admin123<br/>
                  <em>This user has ADMIN privileges for all operations.</em>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;