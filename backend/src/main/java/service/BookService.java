package com.library.service;

import com.library.dto.book.BookRequest;
import com.library.dto.book.BookResponse;
import com.library.entity.Book;
import com.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // Create new book
    public BookResponse createBook(BookRequest bookRequest) {
        // Check if ISBN already exists
        if (bookRepository.existsByIsbn(bookRequest.getIsbn())) {
            throw new RuntimeException("Book with ISBN " + bookRequest.getIsbn() + " already exists");
        }

        // Create new book
        Book book = new Book();
        book.setTitle(bookRequest.getTitle());
        book.setAuthor(bookRequest.getAuthor());
        book.setIsbn(bookRequest.getIsbn());
        book.setPublisher(bookRequest.getPublisher());
        book.setPublishedYear(bookRequest.getPublishedYear());
        book.setCategory(bookRequest.getCategory());
        book.setTotalCopies(bookRequest.getTotalCopies());
        book.setAvailableCopies(bookRequest.getTotalCopies()); // Initially all copies are available
        book.setDescription(bookRequest.getDescription());

        Book savedBook = bookRepository.save(book);
        return BookResponse.fromEntity(savedBook);
    }

    // Get book by ID
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        return BookResponse.fromEntity(book);
    }

    // Get book by ISBN
    public BookResponse getBookByIsbn(String isbn) {
        Book book = bookRepository.findByIsbn(isbn)
                .orElseThrow(() -> new RuntimeException("Book not found with ISBN: " + isbn));
        return BookResponse.fromEntity(book);
    }

    // Get all books
    public List<BookResponse> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get books with pagination and sorting
    public Page<BookResponse> getBooksWithPagination(int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return bookRepository.findAll(pageable)
                .map(BookResponse::fromEntity);
    }

    // Get available books only
    public List<BookResponse> getAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThanOrderByTitleAsc(0).stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get books by category
    public List<BookResponse> getBooksByCategory(String category) {
        return bookRepository.findByCategory(category).stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get books by author
    public List<BookResponse> getBooksByAuthor(String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author).stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Search books (title, author, ISBN)
    public List<BookResponse> searchBooks(String searchTerm) {
        return bookRepository.searchBooks(searchTerm).stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Search books with pagination
    public Page<BookResponse> searchBooksWithPagination(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return bookRepository.searchBooksWithPagination(searchTerm, pageable)
                .map(BookResponse::fromEntity);
    }

    // Update book
    public BookResponse updateBook(Long id, BookRequest bookRequest) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        // Check if ISBN is being changed and if it already exists
        if (!book.getIsbn().equals(bookRequest.getIsbn())) {
            if (bookRepository.existsByIsbn(bookRequest.getIsbn())) {
                throw new RuntimeException("Book with ISBN " + bookRequest.getIsbn() + " already exists");
            }
            book.setIsbn(bookRequest.getIsbn());
        }

        book.setTitle(bookRequest.getTitle());
        book.setAuthor(bookRequest.getAuthor());
        book.setPublisher(bookRequest.getPublisher());
        book.setPublishedYear(bookRequest.getPublishedYear());
        book.setCategory(bookRequest.getCategory());
        book.setDescription(bookRequest.getDescription());

        // Update total copies and adjust available copies accordingly
        int difference = bookRequest.getTotalCopies() - book.getTotalCopies();
        book.setTotalCopies(bookRequest.getTotalCopies());
        book.setAvailableCopies(book.getAvailableCopies() + difference);

        // Ensure available copies doesn't go negative
        if (book.getAvailableCopies() < 0) {
            throw new RuntimeException("Cannot reduce total copies below currently loaned copies");
        }

        Book updatedBook = bookRepository.save(book);
        return BookResponse.fromEntity(updatedBook);
    }

    // Delete book
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        // Check if book has active loans
        int loanedCopies = book.getTotalCopies() - book.getAvailableCopies();
        if (loanedCopies > 0) {
            throw new RuntimeException("Cannot delete book with active loans");
        }

        bookRepository.deleteById(id);
    }

    // Get all categories
    public List<String> getAllCategories() {
        return bookRepository.findDistinctCategories();
    }

    // Get books by publication year range
    public List<BookResponse> getBooksByYearRange(Integer startYear, Integer endYear) {
        return bookRepository.findByPublishedYearBetween(startYear, endYear).stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get most popular books (most loaned)
    public List<BookResponse> getMostPopularBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return bookRepository.findMostPopularBooks(pageable).stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get out of stock books
    public List<BookResponse> getOutOfStockBooks() {
        return bookRepository.findByAvailableCopiesEquals(0).stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Book availability check
    public boolean isBookAvailable(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));
        return book.isAvailable();
    }

    // Reserve book (decrease available copies)
    public void reserveBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        if (!book.isAvailable()) {
            throw new RuntimeException("Book is not available for loan");
        }

        book.decreaseAvailableCopies();
        bookRepository.save(book);
    }

    // Return book (increase available copies)
    public void returnBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        book.increaseAvailableCopies();
        bookRepository.save(book);
    }

    // Get book statistics
    public BookStatistics getBookStatistics() {
        long totalBooks = bookRepository.count();
        long availableBooks = bookRepository.findByAvailableCopiesGreaterThan(0).size();
        long outOfStockBooks = bookRepository.findByAvailableCopiesEquals(0).size();
        List<String> categories = bookRepository.findDistinctCategories();

        return new BookStatistics(totalBooks, availableBooks, outOfStockBooks, categories.size());
    }

    // Inner class for statistics
    public static class BookStatistics {
        private long totalBooks;
        private long availableBooks;
        private long outOfStockBooks;
        private long totalCategories;

        public BookStatistics(long totalBooks, long availableBooks, long outOfStockBooks, long totalCategories) {
            this.totalBooks = totalBooks;
            this.availableBooks = availableBooks;
            this.outOfStockBooks = outOfStockBooks;
            this.totalCategories = totalCategories;
        }

        // Getters
        public long getTotalBooks() { return totalBooks; }
        public long getAvailableBooks() { return availableBooks; }
        public long getOutOfStockBooks() { return outOfStockBooks; }
        public long getTotalCategories() { return totalCategories; }
    }
}