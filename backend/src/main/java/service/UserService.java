package com.library.service;

import com.library.dto.auth.RegisterRequest;
import com.library.dto.user.UserRequest;
import com.library.dto.user.UserResponse;
import com.library.entity.User;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Create new user
    public UserResponse createUser(RegisterRequest registerRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setRole(User.Role.MEMBER); // Default role

        User savedUser = userRepository.save(user);
        return UserResponse.fromEntity(savedUser);
    }

    // Get user by ID
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    // Get user by username
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return UserResponse.fromEntity(user);
    }

    // Get all users
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get users by role
    public List<UserResponse> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Get active users only
    public List<UserResponse> getActiveUsers() {
        return userRepository.findByIsActiveTrue().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Update user
    public UserResponse updateUser(Long id, UserRequest userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Check if username is being changed and if it already exists
        if (!user.getUsername().equals(userRequest.getUsername())) {
            if (userRepository.existsByUsername(userRequest.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(userRequest.getUsername());
        }

        // Check if email is being changed and if it already exists
        if (!user.getEmail().equals(userRequest.getEmail())) {
            if (userRepository.existsByEmail(userRequest.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(userRequest.getEmail());
        }

        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());

        // Update password if provided
        if (userRequest.getPassword() != null && !userRequest.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }

        // Update role if provided and user has permission
        if (userRequest.getRole() != null) {
            try {
                User.Role role = User.Role.valueOf(userRequest.getRole().toUpperCase());
                user.setRole(role);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role: " + userRequest.getRole());
            }
        }

        // Update active status if provided
        if (userRequest.getIsActive() != null) {
            user.setIsActive(userRequest.getIsActive());
        }

        User updatedUser = userRepository.save(user);
        return UserResponse.fromEntity(updatedUser);
    }

    // Delete user (soft delete - set as inactive)
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setIsActive(false);
        userRepository.save(user);
    }

    // Hard delete user
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    // Search users
    public List<UserResponse> searchUsers(String searchTerm) {
        return userRepository.searchUsers(searchTerm).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Change user role (admin function)
    public UserResponse changeUserRole(Long id, User.Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setRole(role);
        User updatedUser = userRepository.save(user);
        return UserResponse.fromEntity(updatedUser);
    }

    // Get user statistics
    public UserStatistics getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByRole(User.Role.MEMBER) +
                userRepository.countByRole(User.Role.LIBRARIAN) +
                userRepository.countByRole(User.Role.ADMIN);
        long members = userRepository.countByRole(User.Role.MEMBER);
        long librarians = userRepository.countByRole(User.Role.LIBRARIAN);
        long admins = userRepository.countByRole(User.Role.ADMIN);

        return new UserStatistics(totalUsers, activeUsers, members, librarians, admins);
    }

    // Inner class for statistics
    public static class UserStatistics {
        private long totalUsers;
        private long activeUsers;
        private long members;
        private long librarians;
        private long admins;

        public UserStatistics(long totalUsers, long activeUsers, long members, long librarians, long admins) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.members = members;
            this.librarians = librarians;
            this.admins = admins;
        }

        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getActiveUsers() { return activeUsers; }
        public long getMembers() { return members; }
        public long getLibrarians() { return librarians; }
        public long getAdmins() { return admins; }
    }
}