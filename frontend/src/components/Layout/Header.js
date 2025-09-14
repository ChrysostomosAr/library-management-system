import React from 'react';

const Header = () => {
  return (
    <header className="bg-primary text-white py-4 shadow">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h1 className="mb-1 display-6">
              📚 Library Management System
            </h1>
            <p className="mb-0 opacity-75">
              Σύστημα Διαχείρισης Βιβλιοθήκης
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            <div className="d-flex flex-column align-items-md-end">
              <small className="opacity-75">Frontend: React.js</small>
              <small className="opacity-75">Backend: Spring Boot</small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;