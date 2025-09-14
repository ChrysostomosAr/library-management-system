import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Clock, 
  User, 
  Book, 
  Mail, 
  Phone,
  CheckCircle,
  RefreshCw,
  Calendar,
  Search,
  AlertTriangle
} from 'lucide-react';
import loanService from '../../services/loanService';

const OverdueLoans = ({ refreshTrigger = 0, onLoanUpdate, onError }) => {
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('daysOverdue');

  useEffect(() => {
    loadOverdueLoans();
  }, [refreshTrigger]);

  const loadOverdueLoans = async () => {
    setLoading(true);
    
    try {
      const loans = await loanService.getOverdueLoans();
      
      const loansWithDetails = loans.map(loan => ({
        ...loan,
        daysOverdue: loanService.calculateDaysOverdue(loan),
        severity: calculateSeverity(loanService.calculateDaysOverdue(loan))
      }));

      setOverdueLoans(loansWithDetails);

      if (onError) {
        onError('');
      }

    } catch (error) {
      console.error('Error loading overdue loans:', error);
      if (onError) {
        onError('Σφάλμα κατά τη φόρτωση καθυστερημένων δανεισμών: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSeverity = (daysOverdue) => {
    if (daysOverdue <= 7) return 'mild';
    if (daysOverdue <= 30) return 'moderate';
    return 'severe';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'severe': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'mild': return 'Ήπια Καθυστέρηση';
      case 'moderate': return 'Μέτρια Καθυστέρηση';
      case 'severe': return 'Σοβαρή Καθυστέρηση';
      default: return 'Καθυστέρηση';
    }
  };

  const handleReturnBook = async (loanId) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να επιστρέψετε αυτό το βιβλίο;')) {
      return;
    }

    try {
      await loanService.returnBook(loanId);
      await loadOverdueLoans();
      
      if (onLoanUpdate) {
        onLoanUpdate();
      }
      
      alert('Το βιβλίο επιστράφηκε επιτυχώς!');
    } catch (error) {
      if (onError) {
        onError('Σφάλμα κατά την επιστροφή βιβλίου: ' + error.message);
      }
    }
  };

  const handleSendReminder = async (loan) => {
    alert(`Υπενθύμιση εστάλη στο ${loan.user?.email || 'μέλος'} για το βιβλίο "${loanService.getLoanBookTitle(loan)}"`);
  };

  const filteredLoans = overdueLoans
    .filter(loan => {
      const searchMatch = !searchTerm || 
        loanService.getLoanBookTitle(loan).toLowerCase().includes(searchTerm.toLowerCase()) ||
        loanService.getLoanMemberName(loan).toLowerCase().includes(searchTerm.toLowerCase());
      
      const severityMatch = severityFilter === 'all' || loan.severity === severityFilter;
      
      return searchMatch && severityMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'daysOverdue':
          return b.daysOverdue - a.daysOverdue;
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'bookTitle':
          return loanService.getLoanBookTitle(a).localeCompare(loanService.getLoanBookTitle(b));
        case 'memberName':
          return loanService.getLoanMemberName(a).localeCompare(loanService.getLoanMemberName(b));
        default:
          return 0;
      }
    });

  const severityStats = {
    mild: filteredLoans.filter(loan => loan.severity === 'mild').length,
    moderate: filteredLoans.filter(loan => loan.severity === 'moderate').length,
    severe: filteredLoans.filter(loan => loan.severity === 'severe').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
        <span className="text-gray-600">Φόρτωση καθυστερημένων δανεισμών...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <AlertCircle className="h-6 w-6 mr-2 text-red-600" />
          Καθυστερημένοι Δανεισμοί
          <span className="text-lg font-normal text-gray-500 ml-2">
            ({filteredLoans.length})
          </span>
        </h2>
        
        <button
          onClick={loadOverdueLoans}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Ανανέωση
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Ήπιες (1-7 ημέρες)</p>
              <p className="text-2xl font-bold text-yellow-900">{severityStats.mild}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Μέτριες (8-30 ημέρες)</p>
              <p className="text-2xl font-bold text-orange-900">{severityStats.moderate}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Σοβαρές (30+ ημέρες)</p>
              <p className="text-2xl font-bold text-red-900">{severityStats.severe}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Αναζήτηση βιβλίου ή μέλους..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        >
          <option value="all">Όλες οι καθυστερήσεις</option>
          <option value="mild">Ήπιες (1-7 ημέρες)</option>
          <option value="moderate">Μέτριες (8-30 ημέρες)</option>
          <option value="severe">Σοβαρές (30+ ημέρες)</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        >
          <option value="daysOverdue">Ημέρες καθυστέρησης</option>
          <option value="dueDate">Ημερομηνία επιστροφής</option>
          <option value="bookTitle">Τίτλος βιβλίου</option>
          <option value="memberName">Όνομα μέλους</option>
        </select>
      </div>

      {filteredLoans.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Δεν υπάρχουν καθυστερημένοι δανεισμοί!
          </h3>
          <p className="text-green-600">Όλα τα βιβλία είναι εντός των προθεσμιών τους.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => (
            <div
              key={loan.id}
              className={`bg-white p-6 rounded-lg border-l-4 shadow-sm ${
                loan.severity === 'severe' 
                  ? 'border-l-red-500 bg-red-50' 
                  : loan.severity === 'moderate'
                  ? 'border-l-orange-500 bg-orange-50'
                  : 'border-l-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Book className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {loanService.getLoanBookTitle(loan)}
                      </span>
                    </div>
                    {loan.book?.author && (
                      <p className="text-sm text-gray-600 ml-6">{loan.book.author}</p>
                    )}
                    {loan.book?.isbn && (
                      <p className="text-xs text-gray-500 ml-6">ISBN: {loan.book.isbn}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {loanService.getLoanMemberName(loan)}
                      </span>
                    </div>
                    {loan.user?.email && (
                      <p className="text-sm text-gray-600 ml-6 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {loan.user.email}
                      </p>
                    )}
                    {loan.user?.phone && (
                      <p className="text-sm text-gray-600 ml-6 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {loan.user.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-red-400 mr-2" />
                      <span className="text-sm font-medium text-red-600">
                        Προθεσμία: {loanService.formatDate(loan.dueDate)}
                      </span>
                    </div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(loan.severity)}`}>
                      {loan.daysOverdue} ημέρες καθυστέρηση
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getSeverityLabel(loan.severity)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleReturnBook(loan.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Επιστροφή</span>
                  </button>
                  
                  <button
                    onClick={() => handleSendReminder(loan)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Υπενθύμιση</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OverdueLoans;