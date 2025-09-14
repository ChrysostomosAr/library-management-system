package com.library.dto.loan;

import com.library.entity.BookLoan;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LoanResponse {

    private Long id;
    private Long userId;
    private String username;
    private String userFullName;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookIsbn;
    private LocalDateTime loanDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private String status;
    private BigDecimal fine;
    private String notes;
    private boolean isOverdue;
    private long daysOverdue;

    // Constructors
    public LoanResponse() {}

    public LoanResponse(Long id, Long userId, String username, String userFullName,
                        Long bookId, String bookTitle, String bookAuthor, String bookIsbn,
                        LocalDateTime loanDate, LocalDateTime dueDate, LocalDateTime returnDate,
                        String status, BigDecimal fine, String notes, boolean isOverdue, long daysOverdue) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.userFullName = userFullName;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookAuthor = bookAuthor;
        this.bookIsbn = bookIsbn;
        this.loanDate = loanDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.status = status;
        this.fine = fine;
        this.notes = notes;
        this.isOverdue = isOverdue;
        this.daysOverdue = daysOverdue;
    }

    // Static factory method from Entity
    public static LoanResponse fromEntity(BookLoan loan) {
        return new LoanResponse(
                loan.getId(),
                loan.getUser().getId(),
                loan.getUser().getUsername(),
                loan.getUser().getFirstName() + " " + loan.getUser().getLastName(),
                loan.getBook().getId(),
                loan.getBook().getTitle(),
                loan.getBook().getAuthor(),
                loan.getBook().getIsbn(),
                loan.getLoanDate(),
                loan.getDueDate(),
                loan.getReturnDate(),
                loan.getStatus().name(),
                loan.getFine(),
                loan.getNotes(),
                loan.isOverdue(),
                loan.getDaysOverdue()
        );
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBookAuthor() {
        return bookAuthor;
    }

    public void setBookAuthor(String bookAuthor) {
        this.bookAuthor = bookAuthor;
    }

    public String getBookIsbn() {
        return bookIsbn;
    }

    public void setBookIsbn(String bookIsbn) {
        this.bookIsbn = bookIsbn;
    }

    public LocalDateTime getLoanDate() {
        return loanDate;
    }

    public void setLoanDate(LocalDateTime loanDate) {
        this.loanDate = loanDate;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDateTime returnDate) {
        this.returnDate = returnDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getFine() {
        return fine;
    }

    public void setFine(BigDecimal fine) {
        this.fine = fine;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isOverdue() {
        return isOverdue;
    }

    public void setOverdue(boolean overdue) {
        isOverdue = overdue;
    }

    public long getDaysOverdue() {
        return daysOverdue;
    }

    public void setDaysOverdue(long daysOverdue) {
        this.daysOverdue = daysOverdue;
    }

    @Override
    public String toString() {
        return "LoanResponse{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", bookTitle='" + bookTitle + '\'' +
                ", loanDate=" + loanDate +
                ", dueDate=" + dueDate +
                ", status='" + status + '\'' +
                ", isOverdue=" + isOverdue +
                '}';
    }
}