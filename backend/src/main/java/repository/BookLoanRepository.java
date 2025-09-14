package com.library.repository;

import com.library.entity.BookLoan;
import com.library.entity.User;
import com.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookLoanRepository extends JpaRepository<BookLoan, Long> {

    // Find loans by user
    List<BookLoan> findByUser(User user);

    // Find loans by user ID
    List<BookLoan> findByUserId(Long userId);

    // Find loans by book
    List<BookLoan> findByBook(Book book);

    // Find loans by status
    List<BookLoan> findByStatus(BookLoan.LoanStatus status);

    // Find active loans for a user
    List<BookLoan> findByUserAndStatus(User user, BookLoan.LoanStatus status);

    // Find active loans for a user by user ID
    List<BookLoan> findByUserIdAndStatus(Long userId, BookLoan.LoanStatus status);

    // Find if user has an active loan for a specific book
    Optional<BookLoan> findByUserAndBookAndStatus(User user, Book book, BookLoan.LoanStatus status);

    // Find overdue loans
    @Query("SELECT bl FROM BookLoan bl WHERE " +
            "bl.status = 'ACTIVE' AND bl.dueDate < :currentDate")
    List<BookLoan> findOverdueLoans(@Param("currentDate") LocalDateTime currentDate);

    // Find loans due soon (within specified days)
    @Query("SELECT bl FROM BookLoan bl WHERE " +
            "bl.status = 'ACTIVE' AND bl.dueDate BETWEEN :currentDate AND :dueDate")
    List<BookLoan> findLoansDueSoon(@Param("currentDate") LocalDateTime currentDate,
                                    @Param("dueDate") LocalDateTime dueDate);

    // Count active loans by user
    long countByUserAndStatus(User user, BookLoan.LoanStatus status);

    // Count active loans by user ID
    long countByUserIdAndStatus(Long userId, BookLoan.LoanStatus status);

    // Find user's loan history with pagination
    Page<BookLoan> findByUserOrderByLoanDateDesc(User user, Pageable pageable);

    // Find user's loan history by user ID with pagination
    Page<BookLoan> findByUserIdOrderByLoanDateDesc(Long userId, Pageable pageable);

    // Find all loans within a date range
    List<BookLoan> findByLoanDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find loans by book and date range (for book popularity analysis)
    List<BookLoan> findByBookAndLoanDateBetween(Book book, LocalDateTime startDate, LocalDateTime endDate);

    // Get loan statistics - total loans
    @Query("SELECT COUNT(bl) FROM BookLoan bl")
    long getTotalLoansCount();

    // Get loan statistics - active loans count
    @Query("SELECT COUNT(bl) FROM BookLoan bl WHERE bl.status = 'ACTIVE'")
    long getActiveLoansCount();

    // Get loan statistics - overdue loans count
    @Query("SELECT COUNT(bl) FROM BookLoan bl WHERE bl.status = 'ACTIVE' AND bl.dueDate < :currentDate")
    long getOverdueLoansCount(@Param("currentDate") LocalDateTime currentDate);

    // Find most active borrowers
    @Query("SELECT bl.user, COUNT(bl) as loanCount FROM BookLoan bl " +
            "GROUP BY bl.user ORDER BY COUNT(bl) DESC")
    List<Object[]> findMostActiveBorrowers(Pageable pageable);

    // Find loans with fines
    List<BookLoan> findByFineGreaterThan(java.math.BigDecimal amount);

    // Check if user can borrow more books (business rule: max 5 active loans)
    @Query("SELECT CASE WHEN COUNT(bl) < 5 THEN true ELSE false END " +
            "FROM BookLoan bl WHERE bl.user = :user AND bl.status = 'ACTIVE'")
    boolean canUserBorrowMoreBooks(@Param("user") User user);
}