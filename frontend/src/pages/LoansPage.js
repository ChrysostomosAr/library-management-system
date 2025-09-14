// pages/LoansPage.js
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  AlertCircle, 
  Users,
  Calendar,
  CheckCircle,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';

// Import components
import CreateLoan from '../components/Loans/CreateLoan';
import LoanList from '../components/Loans/LoanList';
import LoanStatistics from '../components/Loans/LoanStatistics';
import OverdueLoans from '../components/Loans/OverdueLoans';


// Import services
import loanService from '../services/loanService';

const LoansPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState('checking'); // checking, authenticated, unauthenticated
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = loanService.getAuthToken();
      if (!token) {
        setAuthStatus('unauthenticated');
        setError('Δεν βρέθηκε token authentication. Παρακαλώ συνδεθείτε.');
        return;
      }

      const isAuthenticated = await loanService.testAuth();
      if (isAuthenticated) {
        setAuthStatus('authenticated');
        setError('');
      } else {
        setAuthStatus('unauthenticated');
        setError('Το token authentication δεν είναι έγκυρο. Παρακαλώ συνδεθείτε ξανά.');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setAuthStatus('unauthenticated');
      setError('Πρόβλημα με την επαλήθευση authentication.');
    }
  };

  const handleLoanCreated = () => {
    // Trigger refresh for all components
    setRefreshTrigger(prev => prev + 1);
    
    // Switch to active loans to see the new loan
    setActiveTab('active-loans');
  };

  const handleLoanUpdate = () => {
    // Trigger refresh for all components
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRetry = () => {
    setError('');
    checkAuthentication();
  };

  const handleDebugConnection = async () => {
    await loanService.debugConnection();
  };

  // Authentication error display
  if (authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Δοκιμή Ξανά
              </button>
              
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Μετάβαση στο Login
              </button>
              
              <button
                onClick={handleDebugConnection}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Debug Connection (Console)
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Πληροφορίες Debug:</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}</p>
                <p><strong>Token:</strong> {loanService.getAuthToken() ? 'Υπάρχει' : 'Λείπει'}</p>
                <p><strong>Status:</strong> {authStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading authentication
  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Επαλήθευση authentication...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Επισκόπηση', 
      icon: BookOpen,
      description: 'Στατιστικά και πρόσφατη δραστηριότητα'
    },
    { 
      id: 'create', 
      label: 'Νέος Δανεισμός', 
      icon: Plus,
      description: 'Δημιουργία νέου δανεισμού βιβλίου'
    },
    { 
      id: 'active-loans', 
      label: 'Ενεργοί Δανεισμοί', 
      icon: Calendar,
      description: 'Διαχείριση όλων των ενεργών δανεισμών'
    },
    { 
      id: 'overdue', 
      label: 'Καθυστερημένα', 
      icon: AlertCircle,
      description: 'Διαχείριση καθυστερημένων επιστροφών'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
                Διαχείριση Δανεισμών
              </h1>
              <p className="text-gray-600 mt-1">Σύστημα διαχείρισης δανεισμών βιβλιοθήκης</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDebugConnection}
                className="text-gray-400 hover:text-gray-600"
                title="Debug Connection"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Συνδεδεμένος</span>
              </div>
              
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('el-GR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleRetry}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setError('')}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <div key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      <div className="text-left flex-1">
                        <div>{tab.label}</div>
                        {activeTab === tab.id && (
                          <div className="text-xs text-blue-600 mt-1">
                            {tab.description}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </nav>

            {/* Quick Stats in Sidebar */}
            <div className="mt-8">
              <LoanStatistics 
                compact={true} 
                refreshTrigger={refreshTrigger}
                onError={setError}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <LoanStatistics 
                  refreshTrigger={refreshTrigger}
                  onError={setError}
                />
                
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-600" />
                    Πρόσφατη Δραστηριότητα
                  </h3>
                  <LoanList 
                    filterStatus="all" 
                    limit={5} 
                    refreshTrigger={refreshTrigger}
                    onLoanUpdate={handleLoanUpdate}
                    onError={setError}
                  />
                </div>
              </div>
            )}

            {activeTab === 'create' && (
              <CreateLoan 
                onLoanCreated={handleLoanCreated}
                onError={setError}
              />
            )}

            {activeTab === 'active-loans' && (
              <LoanList 
                filterStatus="active" 
                refreshTrigger={refreshTrigger}
                onLoanUpdate={handleLoanUpdate}
                onError={setError}
              />
            )}

            {activeTab === 'overdue' && (
              <OverdueLoans 
                refreshTrigger={refreshTrigger}
                onLoanUpdate={handleLoanUpdate}
                onError={setError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoansPage;