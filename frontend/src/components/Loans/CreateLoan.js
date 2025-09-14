import React, { useState, useEffect } from 'react';
import { Plus, Book, User, Calendar, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import loanService from '../../services/loanService';

const CreateLoan = ({ onLoanCreated, onClose, onError }) => {
  const [formData, setFormData] = useState({
    bookId: '',
    memberId: '',
    dueDate: '',
    notes: ''
  });

  const [availableBooks, setAvailableBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingData(true);
    setErrors([]);
    
    try {
      console.log('Loading books and users...');
      
      const [booksData, usersData] = await Promise.all([
        loanService.getAvailableBooks().catch(async (err) => {
          console.warn('Available books failed, trying all books:', err);
          const allBooks = await loanService.getAllBooks();
          return allBooks.filter(book => loanService.isBookAvailable(book));
        }),
        loanService.getAllUsers().catch(() => [])
      ]);

      console.log('Books loaded:', booksData.length);
      console.log('Users loaded:', usersData.length);

      setAvailableBooks(booksData);
      setUsers(usersData);

      if (booksData.length === 0) {
        setErrors(['Δεν υπάρχουν διαθέσιμα βιβλία για δανεισμό.']);
      }

      if (usersData.length === 0) {
        setErrors(prev => [...prev, 'Δεν υπάρχουν χρήστες για δανεισμό.']);
      }

    } catch (error) {
      const errorMsg = 'Σφάλμα κατά τη φόρτωση δεδομένων: ' + error.message;
      setErrors([errorMsg]);
      if (onError) onError(errorMsg);
      console.error('Error loading initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors.length > 0) setErrors([]);
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = loanService.validateLoanData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const selectedBook = availableBooks.find(book => book.id === parseInt(formData.bookId));
    if (!selectedBook) {
      setErrors(['Το επιλεγμένο βιβλίο δεν είναι διαθέσιμο.']);
      return;
    }

    if (!loanService.isBookAvailable(selectedBook)) {
      setErrors(['Το βιβλίο δεν έχει διαθέσιμα αντίτυπα.']);
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccess('');

    try {
      const loanData = {
        bookId: parseInt(formData.bookId),
        memberId: parseInt(formData.memberId),
        dueDate: formData.dueDate,
        notes: formData.notes.trim() || null
      };

      console.log('Creating loan with data:', loanData);

      const createdLoan = await loanService.createLoan(loanData);
      
      console.log('Loan created successfully:', createdLoan);

      const bookTitle = loanService.getBookTitle(selectedBook);
      const userName = getUserFullName(parseInt(formData.memberId));
      const successMsg = `Δανεισμός δημιουργήθηκε επιτυχώς!\n\nΒιβλίο: ${bookTitle}\nΧρήστης: ${userName}\nΗμερομηνία επιστροφής: ${loanService.formatDate(formData.dueDate)}`;
      
      setSuccess(successMsg);

      setFormData({
        bookId: '',
        memberId: '',
        dueDate: '',
        notes: ''
      });

      await loadInitialData();

      if (onLoanCreated) {
        onLoanCreated(createdLoan);
      }

    } catch (error) {
      const errorMsg = 'Σφάλμα κατά τη δημιουργία δανεισμού: ' + error.message;
      setErrors([errorMsg]);
      if (onError) onError(errorMsg);
      console.error('Error creating loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      bookId: '',
      memberId: '',
      dueDate: '',
      notes: ''
    });
    setErrors([]);
    setSuccess('');
    
    if (onClose) {
      onClose();
    }
  };

  const getDefaultDueDate = () => {
    const today = new Date();
    const defaultDate = new Date(today.getTime() + (14 * 24 * 60 * 60 * 1000));
    return defaultDate.toISOString().split('T')[0];
  };

  const getUserFullName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? loanService.getUserFullName(user) : '';
  };

  if (loadingData) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-gray-600">Φόρτωση δεδομένων...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Plus className="h-6 w-6 mr-2 text-blue-600" />
          Νέος Δανεισμός
        </h2>
        {onClose && (
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-green-800 font-medium mb-1">Επιτυχία!</h4>
              <p className="text-green-700 text-sm whitespace-pre-line">{success}</p>
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-red-800 font-medium mb-1">Σφάλματα:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Book className="h-4 w-4 inline mr-1" />
              Επιλογή Βιβλίου *
            </label>
            <select
              name="bookId"
              value={formData.bookId}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            >
              <option value="">Επιλέξτε βιβλίο...</option>
              {availableBooks.map(book => (
                <option key={book.id} value={book.id}>
                  {loanService.getBookTitle(book)} - {loanService.getBookAuthor(book)}
                  {book.availableCopies && ` (${book.availableCopies} διαθέσιμα)`}
                  {loanService.getBookISBN(book) && ` - ISBN: ${loanService.getBookISBN(book)}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Διαθέσιμα βιβλία: {availableBooks.length}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Επιλογή Χρήστη *
            </label>
            <select
              name="memberId"
              value={formData.memberId}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            >
              <option value="">Επιλέξτε χρήστη...</option>
              {users.filter(user => user.isActive).map(user => (
                <option key={user.id} value={user.id}>
                  {loanService.getUserFullName(user)}
                  {user.role && ` (${user.role})`}
                  {loanService.getUserEmail(user) && ` - ${loanService.getUserEmail(user)}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Ενεργοί χρήστες: {users.filter(u => u.isActive).length}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Ημερομηνία Επιστροφής *
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, dueDate: getDefaultDueDate()}))}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              📅 Προεπιλογή: 2 εβδομάδες
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Σημειώσεις
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Προαιρετικές σημειώσεις για το δανεισμό..."
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            Ακύρωση
          </button>
          
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg flex items-center space-x-2 focus:ring-2 focus:ring-blue-500"
            disabled={loading || availableBooks.length === 0 || users.length === 0}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Καταχώρηση...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Καταχώρηση Δανεισμού</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Πληροφορίες:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Η προεπιλεγμένη περίοδος δανεισμού είναι 2 εβδομάδες</li>
          <li>• Μόνο διαθέσιμα βιβλία εμφανίζονται στη λίστα</li>
          <li>• Η ημερομηνία επιστροφής δεν μπορεί να είναι στο παρελθόν</li>
          <li>• Τα διαθέσιμα αντίτυπα ενημερώνονται αυτόματα μετά το δανεισμό</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateLoan;