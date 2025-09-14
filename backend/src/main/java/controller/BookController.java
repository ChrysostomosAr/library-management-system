package com.library.controller;

import com.library.dto.book.BookRequest;
import com.library.dto.book.BookResponse;
import com.library.service.BookService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookController {


    @Autowired
    private BookService bookService;
    // Get all books (accessible to all authenticated users)
    @GetMapping
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BookResponse>> getAllBooks() {
        List<BookResponse> books = bookService.getAllBooks();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API is working!");
    }

    // Get books with pagination
    @GetMapping("/paginated")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Page<BookResponse>> getBooksWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        Page<BookResponse> books = bookService.getBooksWithPagination(page, size, sortBy, sortDirection);
        return ResponseEntity.ok(books);
    }

    // Get book by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> getBookById(@PathVariable Long id) {
        try {
            BookResponse book = bookService.getBookById(id);
            return ResponseEntity.ok(book);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get book by ISBN
    @GetMapping("/isbn/{isbn}")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> getBookByIsbn(@PathVariable String isbn) {
        try {
            BookResponse book = bookService.getBookByIsbn(isbn);
            return ResponseEntity.ok(book);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Search books
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BookResponse>> searchBooks(@RequestParam String query) {
        List<BookResponse> books = bookService.searchBooks(query);
        return ResponseEntity.ok(books);
    }

    // Search books with pagination
    @GetMapping("/search/paginated")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Page<BookResponse>> searchBooksWithPagination(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<BookResponse> books = bookService.searchBooksWithPagination(query, page, size);
        return ResponseEntity.ok(books);
    }

    // Get books by category
    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BookResponse>> getBooksByCategory(@PathVariable String category) {
        List<BookResponse> books = bookService.getBooksByCategory(category);
        return ResponseEntity.ok(books);
    }

    // Get books by author
    @GetMapping("/author/{author}")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BookResponse>> getBooksByAuthor(@PathVariable String author) {
        List<BookResponse> books = bookService.getBooksByAuthor(author);
        return ResponseEntity.ok(books);
    }

    // Get available books only
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BookResponse>> getAvailableBooks() {
        List<BookResponse> books = bookService.getAvailableBooks();
        return ResponseEntity.ok(books);
    }

    // Get all categories
    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = bookService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // Get most popular books
    @GetMapping("/popular")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BookResponse>> getMostPopularBooks(
            @RequestParam(defaultValue = "10") int limit) {
        List<BookResponse> books = bookService.getMostPopularBooks(limit);
        return ResponseEntity.ok(books);
    }

    // Create new book (Librarian and Admin only)
    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> createBook(@Valid @RequestBody BookRequest bookRequest) {
        try {
            BookResponse book = bookService.createBook(bookRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(book);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Book creation failed", e.getMessage()));
        }
    }

    // Update book (Librarian and Admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @Valid @RequestBody BookRequest bookRequest) {
        try {
            BookResponse book = bookService.updateBook(id, bookRequest);
            return ResponseEntity.ok(book);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Book update failed", e.getMessage()));
        }
    }

    // Delete book (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        try {
            bookService.deleteBook(id);
            return ResponseEntity.ok(new SuccessResponse("Book deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Book deletion failed", e.getMessage()));
        }
    }

    // Get book statistics (Librarian and Admin only)
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BookService.BookStatistics> getBookStatistics() {
        BookService.BookStatistics stats = bookService.getBookStatistics();
        return ResponseEntity.ok(stats);
    }

    // Check book availability
    @GetMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<AvailabilityResponse> checkBookAvailability(@PathVariable Long id) {
        try {
            boolean isAvailable = bookService.isBookAvailable(id);
            BookResponse book = bookService.getBookById(id);
            return ResponseEntity.ok(new AvailabilityResponse(
                    isAvailable,
                    book.getAvailableCopies(),
                    book.getTotalCopies()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get out of stock books (Librarian and Admin only)
    @GetMapping("/out-of-stock")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BookResponse>> getOutOfStockBooks() {
        List<BookResponse> books = bookService.getOutOfStockBooks();
        return ResponseEntity.ok(books);
    }

    // Inner classes for responses
    public static class ErrorResponse {
        private String error;
        private String message;
        private long timestamp;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public String getError() { return error; }
        public String getMessage() { return message; }
        public long getTimestamp() { return timestamp; }
    }

    public static class SuccessResponse {
        private String message;
        private long timestamp;

        public SuccessResponse(String message) {
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public String getMessage() { return message; }
        public long getTimestamp() { return timestamp; }
    }

    public static class AvailabilityResponse {
        private boolean available;
        private int availableCopies;
        private int totalCopies;

        public AvailabilityResponse(boolean available, int availableCopies, int totalCopies) {
            this.available = available;
            this.availableCopies = availableCopies;
            this.totalCopies = totalCopies;
        }

        public boolean isAvailable() { return available; }
        public int getAvailableCopies() { return availableCopies; }
        public int getTotalCopies() { return totalCopies; }
    }
}