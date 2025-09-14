package com.library.dto.loan;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class LoanRequest {

    @NotNull(message = "Book ID is required")
    @Positive(message = "Book ID must be positive")
    private Long bookId;

    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be positive")
    private Long userId;

    // Optional - if not provided, system will set default loan period (e.g., 14 days)
    private LocalDateTime dueDate;

    private String notes;

    // Constructors
    public LoanRequest() {}

    public LoanRequest(Long bookId, Long userId) {
        this.bookId = bookId;
        this.userId = userId;
    }

    public LoanRequest(Long bookId, Long userId, LocalDateTime dueDate, String notes) {
        this.bookId = bookId;
        this.userId = userId;
        this.dueDate = dueDate;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public String toString() {
        return "LoanRequest{" +
                "bookId=" + bookId +
                ", userId=" + userId +
                ", dueDate=" + dueDate +
                ", notes='" + notes + '\'' +
                '}';
    }
}