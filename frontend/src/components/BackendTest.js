// src/components/BackendTest.js
import React, { useState } from 'react';
import api from '../services/api';

const BackendTest = () => {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  // Λίστα με συνήθεις endpoints για δοκιμή
  const testEndpoints = [
    'http://localhost:8080',
    'http://localhost:8080/api',
    'http://localhost:8080/api/books',
    'http://localhost:8080/books',
    'http://localhost:8080/api/members',
    'http://localhost:8080/members',
    'http://localhost:8080/api/loans',
    'http://localhost:8080/loans',
    'http://localhost:8081/api/books',
    'http://localhost:9090/api/books',
  ];

  const testBackendConnection = async () => {
    setTesting(true);
    setResults([]);
    const testResults = [];

    console.log('🔍 Ξεκινάω έλεγχο backend endpoints...');

    for (const endpoint of testEndpoints) {
      try {
        console.log(`Δοκιμάζω: ${endpoint}`);
        const response = await api.get(endpoint.replace('http://localhost:8080/api', ''));
        
        testResults.push({
          endpoint,
          status: 'SUCCESS',
          statusCode: response.status,
          data: response.data,
          message: 'Επιτυχής σύνδεση! 🎉'
        });
        
        console.log(`✅ Επιτυχία: ${endpoint}`, response.data);
        
      } catch (error) {
        const errorInfo = {
          endpoint,
          status: 'ERROR',
          statusCode: error.response?.status || 'No Response',
          message: error.code === 'ERR_NETWORK' 
            ? 'Δεν τρέχει server σε αυτό το endpoint'
            : error.response?.status === 404 
            ? 'Server τρέχει αλλά δεν υπάρχει αυτό το endpoint'
            : error.message
        };
        
        testResults.push(errorInfo);
        console.log(`❌ Σφάλμα: ${endpoint}`, error.message);
      }
    }

    setResults(testResults);
    setTesting(false);
    console.log('🏁 Έλεγχος ολοκληρώθηκε!');
  };

  const getStatusBadge = (status, statusCode) => {
    if (status === 'SUCCESS') {
      return <span className="badge bg-success">✅ Επιτυχία ({statusCode})</span>;
    } else if (statusCode === 404) {
      return <span className="badge bg-warning">⚠️ Server OK, No Endpoint</span>;
    } else {
      return <span className="badge bg-danger">❌ Σφάλμα</span>;
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">🔍 Backend Connection Test</h5>
        </div>
        <div className="card-body">
          <p>
            Αυτό το εργαλείο θα δοκιμάσει τη σύνδεση με το backend σε διάφορα συνήθη endpoints.
          </p>
          
          <button 
            className="btn btn-primary mb-4" 
            onClick={testBackendConnection}
            disabled={testing}
          >
            {testing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Δοκιμάζω σύνδεση...
              </>
            ) : (
              '🚀 Δοκιμή Σύνδεσης Backend'
            )}
          </button>

          {results.length > 0 && (
            <div className="mt-4">
              <h6>Αποτελέσματα:</h6>
              <div className="table-responsive">
                <table className="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th>Status</th>
                      <th>Μήνυμα</th>
                      <th>Data Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className={result.status === 'SUCCESS' ? 'table-success' : result.statusCode === 404 ? 'table-warning' : 'table-danger'}>
                        <td>
                          <small><code>{result.endpoint}</code></small>
                        </td>
                        <td>
                          {getStatusBadge(result.status, result.statusCode)}
                        </td>
                        <td>
                          <small>{result.message}</small>
                        </td>
                        <td>
                          {result.data && (
                            <details>
                              <summary className="btn btn-sm btn-outline-info">Δες Data</summary>
                              <pre className="mt-2 p-2 bg-light rounded" style={{fontSize: '10px', maxHeight: '100px', overflow: 'auto'}}>
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Σύνοψη */}
              <div className="alert alert-info mt-3">
                <strong>Σύνοψη:</strong>
                <ul className="mb-0 mt-2">
                  <li>✅ Επιτυχημένες συνδέσεις: {results.filter(r => r.status === 'SUCCESS').length}</li>
                  <li>⚠️ Server τρέχει αλλά δεν υπάρχει endpoint: {results.filter(r => r.statusCode === 404).length}</li>
                  <li>❌ Δεν τρέχει server: {results.filter(r => r.status === 'ERROR' && r.statusCode !== 404).length}</li>
                </ul>
              </div>

              {/* Οδηγίες */}
              {results.some(r => r.status === 'SUCCESS') && (
                <div className="alert alert-success">
                  <strong>🎉 Βρέθηκε δουλεύων backend!</strong><br/>
                  Χρησιμοποίησε τα endpoints με ✅ για τη σύνδεση του frontend.
                </div>
              )}

              {results.filter(r => r.statusCode === 404).length > 0 && results.filter(r => r.status === 'SUCCESS').length === 0 && (
                <div className="alert alert-warning">
                  <strong>⚠️ Server τρέχει αλλά δεν βρέθηκαν API endpoints!</strong><br/>
                  Το backend τρέχει αλλά χρειάζεται να δημιουργήσεις τα REST endpoints.
                </div>
              )}

              {results.every(r => r.status === 'ERROR' && r.statusCode !== 404) && (
                <div className="alert alert-danger">
                  <strong>❌ Δεν τρέχει κανένα backend!</strong><br/>
                  Εκκίνησε το Spring Boot project και ξανάδοκίμασε.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackendTest;