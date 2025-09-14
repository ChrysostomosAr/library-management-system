package com.library.repository;

import com.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // Find book by ISBN
    Optional<Book> findByIsbn(String isbn);

    // Check if ISBN exists
    boolean existsByIsbn(String isbn);

    // Find available books
    List<Book> findByAvailableCopiesGreaterThan(Integer copies);

    // Find books by category
    List<Book> findByCategory(String category);

    // Find books by author (case insensitive)
    List<Book> findByAuthorContainingIgnoreCase(String author);

    // Find books by title (case insensitive)
    List<Book> findByTitleContainingIgnoreCase(String title);

    // Search books by title, author, or ISBN (case insensitive)
    @Query("SELECT b FROM Book b WHERE " +
            "LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Book> searchBooks(@Param("searchTerm") String searchTerm);

    // Search books with pagination
    @Query("SELECT b FROM Book b WHERE " +
            "LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Book> searchBooksWithPagination(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Find books by category with pagination
    Page<Book> findByCategory(String category, Pageable pageable);

    // Find all available books
    List<Book> findByAvailableCopiesGreaterThanOrderByTitleAsc(Integer copies);

    // Get distinct categories
    @Query("SELECT DISTINCT b.category FROM Book b WHERE b.category IS NOT NULL ORDER BY b.category")
    List<String> findDistinctCategories();

    // Find books published in a specific year range
    List<Book> findByPublishedYearBetween(Integer startYear, Integer endYear);

    // Find most popular books (books with most loans)
    @Query("SELECT b FROM Book b " +
            "LEFT JOIN b.loans bl " +
            "GROUP BY b " +
            "ORDER BY COUNT(bl) DESC")
    List<Book> findMostPopularBooks(Pageable pageable);

    // Count books by category
    long countByCategory(String category);

    // Find books that are out of stock (no available copies)
    List<Book> findByAvailableCopiesEquals(Integer copies);
}