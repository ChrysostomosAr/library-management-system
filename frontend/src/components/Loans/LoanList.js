import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Book, 
  User, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Edit,
  RotateCcw
} from 'lucide-react';
import loanService from '../../services/loanService';

const LoanList = ({ filterStatus = 'all', limit = null, refreshTrigger = 0, onLoanUpdate, onError }) => {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterStatus);
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = limit || 10;

  useEffect(() => {
    loadLoans();
  }, [refreshTrigger]);

  useEffect(() => {
    setStatusFilter(filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    applyFilters();
  }, [loans, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  const loadLoans = async () => {
    setLoading(true);
    
    try {
      let loansData;
      
      switch (filterStatus) {
        case 'active':
          loansData = await loanService.getActiveLoans();
          break;
        case 'overdue':
          loansData = await loanService.getOverdueLoans();
          break;
        default:
          loansData = await loanService.getAllLoans();
      }
      
      setLoans(loansData);

      if (onError) {
        onError('');
      }

    } catch (err) {
      const errorMsg = 'Σφάλμα κατά τη φόρτωση δανεισμών: ' + err.message;
      if (onError) {
        onError(errorMsg);
      }
      console.error('Error loading loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...loans];

    if (searchTerm) {
      filtered = filtered.filter(loan => {
        const bookTitle = loanService.getLoanBookTitle(loan);
        const memberName = loanService.getLoanMemberName(loan);
        const searchString = `${bookTitle} ${memberName}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => {
        const status = loanService.getLoanStatus(loan);
        return status === statusFilter;
      });
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(loan => {
        const loanDate = new Date(loan.loanDate);
        
        switch (dateFilter) {
          case 'thisWeek':
            return loanDate >= oneWeekAgo;
          case 'thisMonth':
            return loanDate >= oneMonthAgo;
          case 'overdue':
            return loanService.isOverdue(loan);
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'bookTitle':
          aValue = loanService.getLoanBookTitle(a).toLowerCase();
          bValue = loanService.getLoanBookTitle(b).toLowerCase();
          break;
        case 'memberName':
          aValue = loanService.getLoanMemberName(a).toLowerCase();
          bValue = loanService.getLoanMemberName(b).toLowerCase();
          break;
        case 'loanDate':
          aValue = new Date(a.loanDate);
          bValue = new Date(b.loanDate);
          break;
        case 'dueDate':
        default:
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredLoans(filtered);
    setCurrentPage(1);
  };

  const handleReturnBook = async (loanId) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να επιστρέψετε αυτό το βιβλίο;')) {
      return;
    }

    try {
      await loanService.returnBook(loanId);
      await loadLoans();
      
      if (onLoanUpdate) {
        onLoanUpdate();
      }
      
      alert('Το βιβλίο επιστράφηκε επιτυχώς!');
    } catch (err) {
      const errorMsg = 'Σφάλμα κατά την επιστροφή βιβλίου: ' + err.message;
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  const handleRenewLoan = async (loanId) => {
    const newDueDate = prompt('Νέα ημερομηνία επιστροφής (YYYY-MM-DD):');
    if (!newDueDate) return;

    try {
      await loanService.renewLoan(loanId, newDueDate);
      await loadLoans();
      
      if (onLoanUpdate) {
        onLoanUpdate();
      }
      
      alert('Ο δανεισμός ανανεώθηκε επιτυχώς!');
    } catch (err) {
      const errorMsg = 'Σφάλμα κατά την ανανέωση δανεισμού: ' + err.message;
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  const getStatusBadge = (loan) => {
    const status = loanService.getLoanStatus(loan);
    
    if (status === 'returned') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Επιστράφηκε
        </span>
      );
    }
    
    if (status === 'overdue') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Καθυστερημένος ({loanService.calculateDaysOverdue(loan)} ημέρες)
        </span>
      );
    }
    
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
        Ενεργός
      </span>
    );
  };

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = filteredLoans.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        <span className="text-gray-600">Φόρτωση δανεισμών...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!limit && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Δανεισμοί
            <span className="text-lg font-normal text-gray-500 ml-2">
              ({filteredLoans.length} από {loans.length})
            </span>
          </h2>
          
          <button
            onClick={loadLoans}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Ανανέωση
          </button>
        </div>
      )}

      {!limit && (
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Αναζήτηση..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Όλα</option>
            <option value="active">Ενεργά</option>
            <option value="overdue">Καθυστερημένα</option>
            <option value="returned">Επιστραμμένα</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Όλες οι ημερομηνίες</option>
            <option value="thisWeek">Αυτή την εβδομάδα</option>
            <option value="thisMonth">Αυτό το μήνα</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="dueDate">Ημερομηνία επιστροφής</option>
            <option value="loanDate">Ημερομηνία δανεισμού</option>
            <option value="bookTitle">Τίτλος βιβλίου</option>
            <option value="memberName">Όνομα μέλους</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      )}

      {filteredLoans.length !== loans.length && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            Εμφανίζονται {filteredLoans.length} από {loans.length} δανεισμούς
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Βιβλίο
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Μέλος
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Δανεισμός
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Επιστροφή
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Κατάσταση
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ενέργειες
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentLoans.map((loan) => {
                const isActive = loanService.getLoanStatus(loan) === 'active';
                
                return (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Book className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {loanService.getLoanBookTitle(loan)}
                          </div>
                          {loan.book?.author && (
                            <div className="text-xs text-gray-500">{loan.book.author}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {loanService.getLoanMemberName(loan)}
                          </div>
                          {loan.user?.email && (
                            <div className="text-xs text-gray-500">{loan.user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loanService.formatDate(loan.loanDate)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.returnDate ? (
                        <span className="text-green-600">
                          {loanService.formatDate(loan.returnDate)}
                        </span>
                      ) : (
                        <span className={loanService.isOverdue(loan) ? 'text-red-600 font-medium' : 'text-gray-900'}>
                          {loanService.formatDate(loan.dueDate)}
                          {loanService.isOverdue(loan) && (
                            <div className="text-xs text-red-500">
                              {loanService.calculateDaysOverdue(loan)} ημέρες καθυστέρηση
                            </div>
                          )}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(loan)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {isActive && (
                          <>
                            <button
                              onClick={() => handleReturnBook(loan.id)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 disabled:text-green-300 flex items-center space-x-1"
                              title="Επιστροφή βιβλίου"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="hidden md:inline">Επιστροφή</span>
                            </button>

                            <button
                              onClick={() => handleRenewLoan(loan.id)}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-900 disabled:text-blue-300 flex items-center space-x-1"
                              title="Ανανέωση δανεισμού"
                            >
                              <RotateCcw className="h-4 w-4" />
                              <span className="hidden md:inline">Ανανέωση</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => alert(`Λεπτομέρειες για δανεισμό #${loan.id}`)}
                          className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                          title="Προβολή λεπτομερειών"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden md:inline">Προβολή</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLoans.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν δανεισμοί</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης'
                : 'Δεν υπάρχουν δανεισμοί προς εμφάνιση'
              }
            </p>
          </div>
        )}
      </div>

      {!limit && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Εμφάνιση {startIndex + 1} έως {Math.min(endIndex, filteredLoans.length)} από {filteredLoans.length} αποτελέσματα
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Προηγούμενη
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Επόμενη
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-700">Ενημέρωση δεδομένων...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanList;