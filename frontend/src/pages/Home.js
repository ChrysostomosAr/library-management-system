// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="bg-primary text-white p-5 rounded mb-4">
            <h1 className="display-4 fw-bold">Καλώς ήρθατε στο Library Management System</h1>
            <p className="lead mb-0">
              Διαχειριστείτε εύκολα τα βιβλία, τα μέλη και τους δανεισμούς της βιβλιοθήκης σας.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <div className="display-1 mb-3">📚</div>
              <h5 className="card-title">Διαχείριση Βιβλίων</h5>
              <p className="card-text text-muted">
                Προσθήκη, επεξεργασία και διαγραφή βιβλίων από τη βιβλιοθήκη.
              </p>
              <Link to="/books" className="btn btn-primary">
                Πήγαινε στα Βιβλία
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <div className="display-1 mb-3">👥</div>
              <h5 className="card-title">Διαχείριση Μελών</h5>
              <p className="card-text text-muted">
                Καταχώριση και διαχείριση των μελών της βιβλιοθήκης.
              </p>
              <Link to="/members" className="btn btn-success">
                Πήγαινε στα Μέλη
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <div className="display-1 mb-3">📋</div>
              <h5 className="card-title">Διαχείριση Δανεισμών</h5>
              <p className="card-text text-muted">
                Παρακολούθηση και διαχείριση των δανεισμών βιβλίων.
              </p>
              <Link to="/loans" className="btn btn-warning">
                Πήγαινε στους Δανεισμούς
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <h6><strong>Πληροφορίες Συστήματος:</strong></h6>
            <ul className="mb-0">
              <li>Frontend: React.js με Bootstrap styling</li>
              <li>Backend: Spring Boot με REST API</li>
              <li>Βάση Δεδομένων: SQL Database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;