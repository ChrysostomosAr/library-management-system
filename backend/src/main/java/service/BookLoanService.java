package com.library.service;

import com.library.dto.loan.LoanRequest;
import com.library.dto.loan.LoanResponse;
import com.library.entity.Book;
import com.library.entity.BookLoan;
import com.library.entity.User;
import com.library.repository.BookLoanRepository;
import com.library.repository.BookRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookLoanService {

    @Autowired
    private BookLoanRepository bookLoanRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookService bookService;

    // Default loan period in days
    private static final int DEFAULT_LOAN_PERIOD_DAYS = 14;
    private static final BigDecimal DAILY_FINE_RATE = new BigDecimal("0.50"); // $0.50 per day
    private static final int MAX_ACTIVE_LOANS_PER_USER = 5;

    // Create new loan
    public LoanResponse createLoan(LoanRequest loanRequest) {
        // Validate user
        User user = userRepository.findById(loanRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + loanRequest.getUserId()));

        // Validate book
        Book book = bookRepository.findById(loanRequest.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + loanRequest.getBookId()));

        // Check if user is active
        if (!user.getIsActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // Check if user can borrow more books
        if (!canUserBorrowMoreBooks(user)) {
            throw new RuntimeException("User has reached maximum loan limit (" + MAX_ACTIVE_LOANS_PER_USER + " books)");
        }

        // Check if book is available
        if (!book.isAvailable()) {
            throw new RuntimeException("Book is not available for loan");
        }

// Check if user already has this book on loan
        boolean hasActiveLoan = bookLoanRepository.findByUserIdAndStatus(user.getId(), BookLoan.LoanStatus.ACTIVE)
                .stream()
                .anyMatch(loan -> loan.getBook().getId().equals(book.getId()));

        boolean hasOverdueLoan = bookLoanRepository.findByUserIdAndStatus(user.getId(), BookLoan.LoanStatus.OVERDUE)
                .stream()
                .anyMatch(loan -> loan.getBook().getId().equals(book.getId()));

        if (hasActiveLoan || hasOverdueLoan) {
            throw new RuntimeException("User already has this book on loan");
        }


        // Create loan
        BookLoan loan = new BookLoan();
        loan.setUser(user);
        loan.setBook(book);
        loan.setLoanDate(LocalDateTime.now());

        // Set due date
        LocalDateTime dueDate = loanRequest.getDueDate() != null ?
                loanRequest.getDueDate() :
                LocalDateTime.now().plusDays(DEFAULT_LOAN_PERIOD_DAYS);
        loan.setDueDate(dueDate);

        loan.setStatus(BookLoan.LoanStatus.ACTIVE);
        loan.setNotes(loanRequest.getNotes());

        // Reserve the book (decrease available copies)
        bookService.reserveBook(book.getId());

        BookLoan savedLoan = bookLoanRepository.save(loan);
        return LoanResponse.fromEntity(savedLoan);
    }

    // Return book
    public LoanResponse returnBook(Long loanId) {
        BookLoan loan = bookLoanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + loanId));

        if (loan.getStatus() != BookLoan.LoanStatus.ACTIVE) {
            throw new RuntimeException("Loan is not active");
        }

        // Calculate fine if overdue
        if (loan.isOverdue()) {
            BigDecimal fine = calculateFine(loan);
            loan.setFine(fine);
        }

        // Mark as returned
        loan.returnBook();

        // Return the book (increase available copies)
        bookService.returnBook(loan.getBook().getId());

        BookLoan updatedLoan = bookLoanRepository.save(loan);
        return LoanResponse.fromEntity(updatedLoan);
    }

    // Get loan by ID
    public LoanResponse getLoanById(Long id) {
        BookLoan loan = bookLoanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));
        return LoanResponse.fromEntity(loan);
    }

    // Get all loans
    public List<LoanResponse> getAllLoans() {
        return bookLoanRepository.findAll().stream()
                .map(LoanResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get active loans
    public List<LoanResponse> getActiveLoans() {
        return bookLoanRepository.findByStatus(BookLoan.LoanStatus.ACTIVE).stream()
                .map(LoanResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get loans by user
    public List<LoanResponse> getLoansByUser(Long userId) {
        return bookLoanRepository.findByUserId(userId).stream()
                .map(LoanResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get active loans by user
    public List<LoanResponse> getActiveLoansByUser(Long userId) {
        return bookLoanRepository.findByUserIdAndStatus(userId, BookLoan.LoanStatus.ACTIVE).stream()
                .map(LoanResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get loan history by user with pagination
    public Page<LoanResponse> getLoanHistoryByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return bookLoanRepository.findByUserIdOrderByLoanDateDesc(userId, pageable)
                .map(LoanResponse::fromEntity);
    }

    // Get overdue loans
    public List<LoanResponse> getOverdueLoans() {
        return bookLoanRepository.findOverdueLoans(LocalDateTime.now()).stream()
                .map(LoanResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get loans due soon (within specified days)
    public List<LoanResponse> getLoansDueSoon(int days) {
        LocalDateTime currentDate = LocalDateTime.now();
        LocalDateTime dueDate = currentDate.plusDays(days);
        return bookLoanRepository.findLoansDueSoon(currentDate, dueDate).stream()
                .map(LoanResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Renew loan (extend due date)
    public LoanResponse renewLoan(Long loanId, int additionalDays) {
        BookLoan loan = bookLoanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + loanId));

        if (loan.getStatus() != BookLoan.LoanStatus.ACTIVE) {
            throw new RuntimeException("Cannot renew inactive loan");
        }

        if (loan.isOverdue()) {
            throw new RuntimeException("Cannot renew overdue loan. Please pay fine first.");
        }

        // Extend due date
        loan.setDueDate(loan.getDueDate().plusDays(additionalDays));

        BookLoan updatedLoan = bookLoanRepository.save(loan);
        return LoanResponse.fromEntity(updatedLoan);
    }

    // Pay fine
    public LoanResponse payFine(Long loanId) {
        BookLoan loan = bookLoanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + loanId));

        if (loan.getFine().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("No fine to pay for this loan");
        }

        loan.setFine(BigDecimal.ZERO);
        BookLoan updatedLoan = bookLoanRepository.save(loan);
        return LoanResponse.fromEntity(updatedLoan);
    }

    // Update overdue status for all active loans
    @Transactional
    public void updateOverdueLoans() {
        List<BookLoan> overdueLoans = bookLoanRepository.findOverdueLoans(LocalDateTime.now());

        for (BookLoan loan : overdueLoans) {
            if (loan.getStatus() == BookLoan.LoanStatus.ACTIVE) {
                loan.setStatus(BookLoan.LoanStatus.OVERDUE);
                // Calculate and update fine
                BigDecimal fine = calculateFine(loan);
                loan.setFine(fine);
                bookLoanRepository.save(loan);
            }
        }
    }

    // Get loan statistics
    public LoanStatistics getLoanStatistics() {
        long totalLoans = bookLoanRepository.getTotalLoansCount();
        long activeLoans = bookLoanRepository.getActiveLoansCount();
        long overdueLoans = bookLoanRepository.getOverdueLoansCount(LocalDateTime.now());

        // Calculate total fines
        List<BookLoan> loansWithFines = bookLoanRepository.findByFineGreaterThan(BigDecimal.ZERO);
        BigDecimal totalFines = loansWithFines.stream()
                .map(BookLoan::getFine)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new LoanStatistics(totalLoans, activeLoans, overdueLoans, totalFines);
    }

    // Helper methods
    private boolean canUserBorrowMoreBooks(User user) {
        return bookLoanRepository.canUserBorrowMoreBooks(user);
    }

    private BigDecimal calculateFine(BookLoan loan) {
        if (!loan.isOverdue()) {
            return BigDecimal.ZERO;
        }

        long daysOverdue = loan.getDaysOverdue();
        return DAILY_FINE_RATE.multiply(new BigDecimal(daysOverdue));
    }

    // Inner class for statistics
    public static class LoanStatistics {
        private long totalLoans;
        private long activeLoans;
        private long overdueLoans;
        private BigDecimal totalOutstandingFines;

        public LoanStatistics(long totalLoans, long activeLoans, long overdueLoans, BigDecimal totalOutstandingFines) {
            this.totalLoans = totalLoans;
            this.activeLoans = activeLoans;
            this.overdueLoans = overdueLoans;
            this.totalOutstandingFines = totalOutstandingFines;
        }

        // Getters
        public long getTotalLoans() { return totalLoans; }
        public long getActiveLoans() { return activeLoans; }
        public long getOverdueLoans() { return overdueLoans; }
        public BigDecimal getTotalOutstandingFines() { return totalOutstandingFines; }
    }
}