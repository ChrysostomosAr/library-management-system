// src/components/Layout/Navigation.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active fw-bold' : 'nav-link';
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authService.logout();
      navigate('/');
      window.location.reload(); // Refresh to update UI state
    }
  };

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/books', icon: '📖', label: 'Books', requireAuth: true },
    { path: '/members', icon: '👥', label: 'Members', requireAuth: true, adminOnly: true },
    { path: '/loans', icon: '📋', label: 'Loans', requireAuth: true }
  ];

  // Filter nav items based on authentication and role
  const filteredNavItems = navItems.filter(item => {
    if (!item.requireAuth) return true;
    if (!isAuthenticated) return false;
    if (item.adminOnly && currentUser?.role !== 'ADMIN') return false;
    return true;
  });

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom shadow-sm">
      <div className="container">
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {filteredNavItems.map((item, index) => (
              <li key={index} className="nav-item">
                <Link to={item.path} className={isActive(item.path)}>
                  <span className="me-1">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
            
            {/* Test Backend link - only for authenticated users */}
            {isAuthenticated && (
              <li className="nav-item">
                <Link to="/test-backend" className={isActive('/test-backend')}>
                  <span className="me-1">🔍</span>
                  Backend Test
                </Link>
              </li>
            )}
          </ul>
          
          <div className="navbar-nav">
            {isAuthenticated ? (
              <div className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  id="userDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <span className="me-1">👤</span>
                  {currentUser?.username}
                  <span className={`badge ms-2 ${
                    currentUser?.role === 'ADMIN' ? 'bg-danger' :
                    currentUser?.role === 'LIBRARIAN' ? 'bg-warning' : 'bg-info'
                  }`}>
                    {currentUser?.role}
                  </span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text">
                      <small className="text-muted">
                        {currentUser?.firstName} {currentUser?.lastName}<br/>
                        {currentUser?.email}
                      </small>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <span className="me-2">🚪</span>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="nav-item">
                <Link to="/login" className={isActive('/login')}>
                  <span className="me-1">🔐</span>
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
