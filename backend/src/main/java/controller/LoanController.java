package com.library.controller;

import com.library.dto.loan.LoanRequest;
import com.library.dto.loan.LoanResponse;
import com.library.service.BookLoanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import java.util.List;



@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*", maxAge = 3600)


public class LoanController {

    @Autowired
    private BookLoanService loanService;

    // Create new loan
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> createLoan(@Valid @RequestBody LoanRequest loanRequest) {
        try {
            LoanResponse loan = loanService.createLoan(loanRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(loan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Loan creation failed", e.getMessage()));
        }
    }

    // Get all loans (Librarian and Admin only)
    @GetMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<LoanResponse>> getAllLoans() {
        List<LoanResponse> loans = loanService.getAllLoans();
        return ResponseEntity.ok(loans);
    }

    // Get active loans (Librarian and Admin only)
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<LoanResponse>> getActiveLoans() {
        List<LoanResponse> loans = loanService.getActiveLoans();
        return ResponseEntity.ok(loans);
    }

    // Get overdue loans (Librarian and Admin only)
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<LoanResponse>> getOverdueLoans() {
        List<LoanResponse> loans = loanService.getOverdueLoans();
        return ResponseEntity.ok(loans);
    }

    // Get loans due soon (Librarian and Admin only)
    @GetMapping("/due-soon")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<LoanResponse>> getLoansDueSoon(
            @RequestParam(defaultValue = "3") int days) {
        List<LoanResponse> loans = loanService.getLoansDueSoon(days);
        return ResponseEntity.ok(loans);
    }

    // Get loan by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> getLoanById(@PathVariable Long id) {
        try {
            LoanResponse loan = loanService.getLoanById(id);
            return ResponseEntity.ok(loan);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get current user's loans
    @GetMapping("/my-loans")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<LoanResponse>> getCurrentUserLoans() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        // Note: This would need additional logic to get user ID from username
        // For now, we'll need to pass user ID as parameter
        return ResponseEntity.badRequest()
                .body(null); // TODO: Implement proper user context handling
    }

    // Get loans by user ID
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<LoanResponse>> getLoansByUser(@PathVariable Long userId) {
        List<LoanResponse> loans = loanService.getLoansByUser(userId);
        return ResponseEntity.ok(loans);
    }

    // Get active loans by user ID
    @GetMapping("/user/{userId}/active")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<LoanResponse>> getActiveLoansByUser(@PathVariable Long userId) {
        List<LoanResponse> loans = loanService.getActiveLoansByUser(userId);
        return ResponseEntity.ok(loans);
    }

    // Get loan history by user with pagination
    @GetMapping("/user/{userId}/history")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Page<LoanResponse>> getLoanHistoryByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<LoanResponse> loans = loanService.getLoanHistoryByUser(userId, page, size);
        return ResponseEntity.ok(loans);
    }

    // Return book
    @PutMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            LoanResponse loan = loanService.returnBook(id);
            return ResponseEntity.ok(loan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Book return failed", e.getMessage()));
        }
    }

    // Renew loan
    @PutMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> renewLoan(
            @PathVariable Long id,
            @RequestParam(defaultValue = "14") int additionalDays) {
        try {
            LoanResponse loan = loanService.renewLoan(id, additionalDays);
            return ResponseEntity.ok(loan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Loan renewal failed", e.getMessage()));
        }
    }

    // Pay fine
    @PutMapping("/{id}/pay-fine")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> payFine(@PathVariable Long id) {
        try {
            LoanResponse loan = loanService.payFine(id);
            return ResponseEntity.ok(loan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Fine payment failed", e.getMessage()));
        }
    }

    // Update overdue loans (Admin only - typically called by scheduled job)
    @PutMapping("/update-overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOverdueLoans() {
        try {
            loanService.updateOverdueLoans();
            return ResponseEntity.ok(new SuccessResponse("Overdue loans updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Failed to update overdue loans", e.getMessage()));
        }
    }

    // Get loan statistics (Librarian and Admin only)
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BookLoanService.LoanStatistics> getLoanStatistics() {
        BookLoanService.LoanStatistics stats = loanService.getLoanStatistics();
        return ResponseEntity.ok(stats);
    }

    // Bulk return books (Admin only)
    @PutMapping("/bulk-return")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkReturnBooks(@RequestBody List<Long> loanIds) {
        try {
            int successCount = 0;
            int failureCount = 0;

            for (Long loanId : loanIds) {
                try {
                    loanService.returnBook(loanId);
                    successCount++;
                } catch (RuntimeException e) {
                    failureCount++;
                }
            }

            return ResponseEntity.ok(new BulkOperationResponse(
                    successCount,
                    failureCount,
                    "Bulk return completed"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Bulk return failed", e.getMessage()));
        }
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

    public static class BulkOperationResponse {
        private int successCount;
        private int failureCount;
        private String message;
        private long timestamp;

        public BulkOperationResponse(int successCount, int failureCount, String message) {
            this.successCount = successCount;
            this.failureCount = failureCount;
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public int getSuccessCount() { return successCount; }
        public int getFailureCount() { return failureCount; }
        public String getMessage() { return message; }
        public long getTimestamp() { return timestamp; }
    }
}