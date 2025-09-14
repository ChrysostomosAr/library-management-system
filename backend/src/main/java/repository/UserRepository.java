package com.library.repository;

import com.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by username for authentication
    Optional<User> findByUsername(String username);

    // Find user by email
    Optional<User> findByEmail(String email);

    // Check if username exists
    boolean existsByUsername(String username);

    // Check if email exists
    boolean existsByEmail(String email);

    // Find users by role
    List<User> findByRole(User.Role role);

    // Find active users
    List<User> findByIsActiveTrue();

    // Find users by role and active status
    List<User> findByRoleAndIsActiveTrue(User.Role role);

    // Search users by first name or last name (case insensitive)
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<User> searchUsers(@Param("searchTerm") String searchTerm);

    // Count users by role
    long countByRole(User.Role role);

    // Find users who haven't returned books (have active loans)
    @Query("SELECT DISTINCT u FROM User u " +
            "INNER JOIN BookLoan bl ON u.id = bl.user.id " +
            "WHERE bl.status = 'ACTIVE'")
    List<User> findUsersWithActiveLoans();
}