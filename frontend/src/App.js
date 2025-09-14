// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import components
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Home from './pages/Home';
import BooksPage from './pages/BooksPage';
import MembersPage from './pages/MembersPage';
import LoansPage from './pages/LoansPage';
import Login from './components/Auth/Login';
import BackendTest from './components/BackendTest';

function App() {
  return (
    <Router>
      <div className="App">
        
        <Navigation />
        
        <main className="mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/test-backend" element={<BackendTest />} />
          </Routes>
        </main>
        
        <footer className="mt-5 py-4 bg-light text-center">
          <div className="container">
            <p className="mb-0">&copy; 2025 Library Management System - Developed with React & Spring Boot</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
