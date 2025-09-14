// services/loanService.js - Τελική έκδοση που δουλεύει με το backend σας

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class LoanService {
  
  // Get authentication token από localStorage
  getAuthToken() {
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('accessToken');
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle API response
  async handleResponse(response) {
    if (response.status === 401 || response.status === 403) {
      console.error('Authentication required. Token may be expired.');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
      throw new Error('Απαιτείται authentication. Παρακαλώ συνδεθείτε ξανά.');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        if (errorText) errorMessage = errorText;
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }

  // =========================
  // BOOKS API METHODS
  // =========================

  async getAllBooks() {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getAvailableBooks() {
    const response = await fetch(`${API_BASE_URL}/books/available`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // =========================
  // USERS/MEMBERS API METHODS  
  // =========================

  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getAllMembers() {
    // Στο σύστημά σας, τα μέλη είναι users με role MEMBER
    const response = await fetch(`${API_BASE_URL}/users?role=MEMBER`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // =========================
  // LOANS API METHODS
  // =========================

  async getAllLoans() {
    const response = await fetch(`${API_BASE_URL}/loans`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getActiveLoans() {
    try {
      const response = await fetch(`${API_BASE_URL}/loans/active`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      // Fallback: filter all loans for active ones
      const allLoans = await this.getAllLoans();
      return allLoans.filter(loan => 
        !loan.returnDate && (loan.status === 'ACTIVE' || loan.status === 'active' || !loan.status)
      );
    }
  }

  async getOverdueLoans() {
    try {
      const response = await fetch(`${API_BASE_URL}/loans/overdue`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      // Fallback: filter active loans for overdue ones
      const activeLoans = await this.getActiveLoans();
      return activeLoans.filter(loan => this.isOverdue(loan));
    }
  }

  async createLoan(loanData) {
    // Προσαρμογή των δεδομένων για το backend σας
    const payload = {
      bookId: loanData.bookId,
      userId: loanData.memberId || loanData.userId,
      dueDate: this.formatDateForAPI(loanData.dueDate), // Με timestamp format
      notes: loanData.notes || null
    };

    console.log('Creating loan with payload:', payload);

    const response = await fetch(`${API_BASE_URL}/loans/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return this.handleResponse(response);
  }

  async returnBook(loanId) {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/return`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async renewLoan(loanId, newDueDate) {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/renew`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        dueDate: this.formatDateForAPI(newDueDate) 
      })
    });
    return this.handleResponse(response);
  }

  // =========================
  // STATISTICS METHODS
  // =========================

  async calculateStatistics() {
    try {
      const [allLoans, allBooks, allUsers] = await Promise.all([
        this.getAllLoans().catch(() => []),
        this.getAllBooks().catch(() => []),
        this.getAllUsers().catch(() => [])
      ]);

      const activeLoans = allLoans.filter(loan => 
        !loan.returnDate && (loan.status === 'ACTIVE' || loan.status === 'active' || !loan.status)
      );

      const overdueLoans = activeLoans.filter(loan => this.isOverdue(loan));

      const returnedLoans = allLoans.filter(loan => 
        loan.returnDate || (loan.status && loan.status.toLowerCase() === 'returned')
      );

      const availableBooks = allBooks.filter(book => book.available === true);
      const members = allUsers.filter(user => user.role === 'MEMBER');

      return {
        totalLoans: allLoans.length,
        activeLoans: activeLoans.length,
        overdueLoans: overdueLoans.length,
        returnedLoans: returnedLoans.length,
        availableBooks: availableBooks.length,
        totalBooks: allBooks.length,
        totalMembers: members.length,
        totalUsers: allUsers.length
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return {
        totalLoans: 0,
        activeLoans: 0,
        overdueLoans: 0,
        returnedLoans: 0,
        availableBooks: 0,
        totalBooks: 0,
        totalMembers: 0,
        totalUsers: 0
      };
    }
  }

  // =========================
  // HELPER METHODS
  // =========================

  // Convert date για το API (με timestamp)
  formatDateForAPI(dateString) {
    if (!dateString) return '';
    // Βεβαιωθείτε ότι έχει timestamp format
    if (dateString.includes('T')) {
      return dateString;
    }
    return dateString + 'T00:00:00';
  }

  isOverdue(loan) {
    if (!loan.dueDate || loan.returnDate) return false;
    const dueDate = new Date(loan.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  calculateDaysOverdue(loan) {
    if (!this.isOverdue(loan)) return 0;
    const dueDate = new Date(loan.dueDate);
    const today = new Date();
    const diffTime = today - dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR');
  }

  formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('el-GR');
  }

  // Προσαρμοσμένα getters για τη δομή των δεδομένων σας
  getBookTitle(book) {
    return book?.title || '';
  }

  getBookAuthor(book) {
    return book?.author || '';
  }

  getBookISBN(book) {
    return book?.isbn || '';
  }

  getUserFullName(user) {
    return user?.userFullName || user?.fullName || 
           `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 
           user?.username || '';
  }

  getUserEmail(user) {
    return user?.email || '';
  }

  isBookAvailable(book) {
    return book?.available === true && (book?.availableCopies || 0) > 0;
  }

  // Get loan details με proper field mapping
  getLoanBookTitle(loan) {
    return loan?.bookTitle || loan?.book?.title || '';
  }

  getLoanMemberName(loan) {
    return loan?.userFullName || loan?.memberName || 
           loan?.member?.fullName || loan?.user?.fullName || '';
  }

  getLoanStatus(loan) {
    if (loan.returnDate) return 'returned';
    if (this.isOverdue(loan)) return 'overdue';
    return 'active';
  }

  // =========================
  // VALIDATION METHODS
  // =========================

  validateLoanData(loanData) {
    const errors = [];

    if (!loanData.bookId) {
      errors.push('Το πεδίο "Βιβλίο" είναι υποχρεωτικό');
    }

    if (!loanData.memberId && !loanData.userId) {
      errors.push('Το πεδίο "Μέλος/Χρήστης" είναι υποχρεωτικό');
    }

    if (!loanData.dueDate) {
      errors.push('Το πεδίο "Ημερομηνία Επιστροφής" είναι υποχρεωτικό');
    } else {
      const dueDate = new Date(loanData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        errors.push('Η ημερομηνία επιστροφής δεν μπορεί να είναι στο παρελθόν');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

// =========================
// AUTHENTICATION METHODS
// =========================

async testAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return response.ok;
  } catch (error) {
    console.error('Auth test failed:', error);
    return false;
  }
}








  // =========================
  // DEBUG METHODS
  // =========================

  async debugConnection() {
    console.log('=== LOAN SERVICE DEBUG ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Auth Token:', this.getAuthToken() ? 'Present (length: ' + this.getAuthToken().length + ')' : 'Missing');
    
    const endpoints = [
      '/books',
      '/books/available', 
      '/users',
      '/users?role=MEMBER',
      '/loans',
      '/loans/create'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: endpoint === '/loans/create' ? 'POST' : 'GET',
          headers: this.getAuthHeaders(),
          body: endpoint === '/loans/create' ? JSON.stringify({
            bookId: 1, userId: 1, dueDate: '2024-09-17T00:00:00'
          }) : undefined
        });
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
  }
}

export default new LoanService();