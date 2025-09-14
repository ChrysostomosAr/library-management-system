import React, { useState, useEffect } from 'react';
import { bookAPI } from '../../services/api';
import loanService from '../../services/loanService';
import memberService from '../../services/memberService';
import './BookList.css';

const EnhancedBookList = () => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');
  const [loanLoading, setLoanLoading] = useState(false);

  // Fetch books and members when component mounts
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [booksResponse, membersResponse] = await Promise.all([
        bookAPI.getAllBooks(),
        memberService.getAllMembers()
      ]);
      
      setBooks(booksResponse.data);
      setMembers(membersResponse);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchInitialData();
      return;
    }

    try {
      setLoading(true);
      const response = await bookAPI.searchBooks(searchQuery);
      setBooks(response.data);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoanBook = (book) => {
    if (book.availableCopies <= 0) {
      alert('This book is not available for loan');
      return;
    }
    setSelectedBook(book);
    setShowLoanModal(true);
  };

  const handleCreateLoan = async () => {
    if (!selectedMember) {
      alert('Please select a member');
      return;
    }

    try {
      setLoanLoading(true);
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

      const loanData = {
        bookId: selectedBook.id,
        memberId: parseInt(selectedMember),
        dueDate: dueDate.toISOString().split('T')[0]
      };

      await loanService.createLoan(loanData);
      
      // Refresh books to update availability
      await fetchInitialData();
      
      // Close modal and reset
      setShowLoanModal(false);
      setSelectedBook(null);
      setSelectedMember('');
      
      alert(`Book "${selectedBook.title}" successfully loaned!`);
    } catch (err) {
      alert('Failed to create loan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoanLoading(false);
    }
  };

  const BookCard = ({ book }) => (
    <div className="book-card">
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <p className="book-isbn">ISBN: {book.isbn}</p>
        {book.category && <span className="book-category">{book.category}</span>}
        {book.publishedYear && <p className="book-year">Published: {book.publishedYear}</p>}
        {book.publisher && <p className="book-publisher">Publisher: {book.publisher}</p>}
        
        <div className="book-availability">
          <span className={book.availableCopies > 0 ? 'available' : 'unavailable'}>
            Available: {book.availableCopies} / {book.totalCopies}
          </span>
        </div>
        
        {book.description && (
          <p className="book-description">{book.description}</p>
        )}
        
        {/* Loan Button */}
        <div className="book-actions">
          {book.availableCopies > 0 ? (
            <button 
              className="loan-button available"
              onClick={() => handleLoanBook(book)}
            >
              📚 Loan This Book
            </button>
          ) : (
            <button className="loan-button unavailable" disabled>
              ❌ Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const LoanModal = () => (
    <div className="modal-overlay" onClick={() => setShowLoanModal(false)}>
      <div className="loan-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📚 Loan Book</h3>
          <button 
            className="close-button"
            onClick={() => setShowLoanModal(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          {selectedBook && (
            <div className="selected-book-info">
              <h4>{selectedBook.title}</h4>
              <p>by {selectedBook.author}</p>
              <p>Available copies: {selectedBook.availableCopies}</p>
            </div>
          )}
          
          <div className="member-selection">
            <label>Select Member:</label>
            <select 
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              required
            >
              <option value="">Choose a member...</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="loan-details">
            <p><strong>Loan Duration:</strong> 14 days</p>
            <p><strong>Due Date:</strong> {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="modal-actions">
          <button 
            className="cancel-button"
            onClick={() => setShowLoanModal(false)}
          >
            Cancel
          </button>
          <button 
            className="confirm-button"
            onClick={handleCreateLoan}
            disabled={!selectedMember || loanLoading}
          >
            {loanLoading ? 'Creating Loan...' : 'Confirm Loan'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <div className="book-list-container">
      <div className="book-list-header">
        <h1>📚 Library Books</h1>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search books by title, author, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            🔍 Search
          </button>
          <button onClick={fetchInitialData} className="refresh-button">
            🔄 Show All
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchInitialData} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {books.length === 0 && !error ? (
        <div className="no-books">
          <p>No books found in the library.</p>
          <p>The database appears to be empty.</p>
        </div>
      ) : (
        <>
          <div className="books-summary">
            <div className="summary-stats">
              <span>Total books: {books.length}</span>
              <span>Available: {books.filter(b => b.availableCopies > 0).length}</span>
              <span>On loan: {books.reduce((sum, b) => sum + (b.totalCopies - b.availableCopies), 0)}</span>
            </div>
          </div>
          
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      )}

      {/* Loan Modal */}
      {showLoanModal && <LoanModal />}
    </div>
  );
};

export default EnhancedBookList;