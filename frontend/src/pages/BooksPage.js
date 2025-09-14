// src/pages/BooksPage.js
import React, { useState, useEffect } from 'react';
import bookService from '../services/bookService';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publishedYear: '',
    category: '',
    totalCopies: 1,
    availableCopies: 1,
    description: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(10);

  // Load data on component mount
  useEffect(() => {
    loadBooks();
    loadCategories();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(data);
      setError(null);
    } catch (err) {
      setError('Σφάλμα κατά τη φόρτωση των βιβλίων: ' + err.message);
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await bookService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      if (editingBook) {
        await bookService.updateBook(editingBook.id, formData);
      } else {
        await bookService.createBook(formData);
      }
      
      await loadBooks();
      await loadCategories(); // Refresh categories in case new one was added
      resetForm();
      setError(null);
    } catch (err) {
      setError('Σφάλμα κατά την αποθήκευση: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publishedYear: book.publishedYear || '',
      category: book.category || '',
      totalCopies: book.totalCopies || 1,
      availableCopies: book.availableCopies || 1,
      description: book.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το βιβλίο "${title}";`)) {
      try {
        await bookService.deleteBook(id);
        await loadBooks();
        setError(null);
      } catch (err) {
        setError('Σφάλμα κατά τη διαγραφή: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      publishedYear: '',
      category: '',
      totalCopies: 1,
      availableCopies: 1,
      description: ''
    });
    setEditingBook(null);
    setShowForm(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadBooks();
      return;
    }
    
    try {
      setLoading(true);
      const results = await bookService.searchBooks(searchTerm);
      setBooks(results);
      setCurrentPage(1);
    } catch (err) {
      setError('Σφάλμα κατά την αναζήτηση: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    if (!category) {
      loadBooks();
      return;
    }
    
    try {
      setLoading(true);
      const results = await bookService.getBooksByCategory(category);
      setBooks(results);
      setCurrentPage(1);
    } catch (err) {
      setError('Σφάλμα κατά το φιλτράρισμα: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading && books.length === 0) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Φόρτωση...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2>📚 Διαχείριση Βιβλίων</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕ Ακύρωση' : '+ Προσθήκη Νέου Βιβλίου'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible mb-4">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>{editingBook ? 'Επεξεργασία Βιβλίου' : 'Προσθήκη Νέου Βιβλίου'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Τίτλος <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    disabled={formSubmitting}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Συγγραφέας <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    required
                    disabled={formSubmitting}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">ISBN <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.isbn}
                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                    required
                    disabled={formSubmitting}
                    placeholder="π.χ. 9781234567890"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Εκδότης</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.publisher}
                    onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                    disabled={formSubmitting}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Κατηγορία</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    disabled={formSubmitting}
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((cat, index) => (
                      <option key={index} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Έτος Έκδοσης</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({...formData, publishedYear: e.target.value})}
                    min="1000"
                    max={new Date().getFullYear()}
                    disabled={formSubmitting}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Σύνολο Αντιτύπων <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={formData.totalCopies}
                    onChange={(e) => {
                      const total = parseInt(e.target.value) || 1;
                      setFormData({
                        ...formData, 
                        totalCopies: total,
                        // Ensure available copies don't exceed total
                        availableCopies: Math.min(formData.availableCopies, total)
                      });
                    }}
                    required
                    disabled={formSubmitting}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Διαθέσιμα Αντίτυπα <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max={formData.totalCopies}
                    value={formData.availableCopies}
                    onChange={(e) => setFormData({...formData, availableCopies: parseInt(e.target.value) || 0})}
                    required
                    disabled={formSubmitting}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Περιγραφή</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  disabled={formSubmitting}
                ></textarea>
              </div>
              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Αποθήκευση...
                    </>
                  ) : (
                    editingBook ? '💾 Ενημέρωση' : '💾 Αποθήκευση'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={resetForm}
                  disabled={formSubmitting}
                >
                  Ακύρωση
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Αναζήτηση</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Αναζήτηση βιβλίων (τίτλος, συγγραφέας, κατηγορία)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-outline-primary" onClick={handleSearch}>
                  🔍 Αναζήτηση
                </button>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Φιλτράρισμα κατά Κατηγορία</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
              >
                <option value="">Όλες οι κατηγορίες</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={loadBooks}>
                🔄 Ανανέωση
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Βιβλία ({books.length})</h6>
            {loading && <div className="spinner-border spinner-border-sm"></div>}
          </div>
        </div>
        <div className="card-body p-0">
          {currentBooks.length === 0 ? (
            <div className="text-center p-5">
              <div className="mb-3">📚</div>
              <h5>Δεν βρέθηκαν βιβλία</h5>
              <p className="text-muted">
                {searchTerm || selectedCategory 
                  ? 'Δοκιμάστε διαφορετικά κριτήρια αναζήτησης' 
                  : 'Προσθέστε το πρώτο σας βιβλίο χρησιμοποιώντας το κουμπί παραπάνω'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Τίτλος</th>
                    <th>Συγγραφέας</th>
                    <th>Κατηγορία</th>
                    <th>Έτος</th>
                    <th>Διαθεσιμότητα</th>
                    <th>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBooks.map(book => (
                    <tr key={book.id}>
                      <td>
                        <div>
                          <strong>{book.title}</strong>
                          {book.isbn && (
                            <>
                              <br />
                              <small className="text-muted">ISBN: {book.isbn}</small>
                            </>
                          )}
                          {book.publisher && (
                            <>
                              <br />
                              <small className="text-muted">Εκδότης: {book.publisher}</small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>{book.author}</td>
                      <td>
                        {book.category && (
                          <span className="badge bg-info text-dark">{book.category}</span>
                        )}
                      </td>
                      <td>{book.publishedYear || 'N/A'}</td>
                      <td>
                        <div>
                          <span className={`badge ${book.availableCopies > 0 ? 'bg-success' : 'bg-danger'}`}>
                            {book.availableCopies}/{book.totalCopies}
                          </span>
                          <br />
                          <small className="text-muted">
                            {book.availableCopies > 0 
                              ? `Διαθέσιμα: ${book.availableCopies}` 
                              : 'Μη διαθέσιμο'
                            }
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(book)}
                            title="Επεξεργασία"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(book.id, book.title)}
                            title="Διαγραφή"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Books pagination" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Προηγούμενο
              </button>
            </li>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => paginate(page)}
                  >
                    {page}
                  </button>
                </li>
              );
            })}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Επόμενο
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default BooksPage;
