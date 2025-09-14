package com.library.service;

import com.library.dto.auth.AuthResponse;
import com.library.dto.auth.LoginRequest;
import com.library.dto.auth.RegisterRequest;
import com.library.entity.User;
import com.library.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    // Register new user
    public AuthResponse register(RegisterRequest registerRequest) {
        // Create user through UserService
        var userResponse = userService.createUser(registerRequest);

        // Load the created user for JWT generation
        User user = new User();
        user.setId(userResponse.getId());
        user.setUsername(userResponse.getUsername());
        user.setEmail(userResponse.getEmail());
        user.setFirstName(userResponse.getFirstName());
        user.setLastName(userResponse.getLastName());
        user.setRole(User.Role.valueOf(userResponse.getRole()));
        user.setIsActive(userResponse.getIsActive());

        // Generate JWT token
        String token = jwtUtil.generateToken(user);

        return AuthResponse.fromUser(token, user);
    }

    // Login user
    public AuthResponse login(LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            // Get authenticated user
            User user = (User) authentication.getPrincipal();

            // Check if user is active
            if (!user.getIsActive()) {
                throw new RuntimeException("Account is deactivated. Please contact administrator.");
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user);

            return AuthResponse.fromUser(token, user);

        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid username or password");
        }
    }

    // Refresh token
    public AuthResponse refreshToken(String token) {
        try {
            if (jwtUtil.canTokenBeRefreshed(token)) {
                String refreshedToken = jwtUtil.refreshToken(token);
                String username = jwtUtil.extractUsername(refreshedToken);

                var userResponse = userService.getUserByUsername(username);

                // Create User object for response
                User user = new User();
                user.setId(userResponse.getId());
                user.setUsername(userResponse.getUsername());
                user.setEmail(userResponse.getEmail());
                user.setFirstName(userResponse.getFirstName());
                user.setLastName(userResponse.getLastName());
                user.setRole(User.Role.valueOf(userResponse.getRole()));
                user.setIsActive(userResponse.getIsActive());

                return AuthResponse.fromUser(refreshedToken, user);
            } else {
                throw new RuntimeException("Token cannot be refreshed");
            }
        } catch (Exception e) {
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }

    // Validate token
    public boolean validateToken(String token) {
        try {
            String username = jwtUtil.extractUsername(token);
            return username != null && !jwtUtil.isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    // Get current user from token
    public User getCurrentUserFromToken(String token) {
        String username = jwtUtil.extractUsername(token);
        var userResponse = userService.getUserByUsername(username);

        User user = new User();
        user.setId(userResponse.getId());
        user.setUsername(userResponse.getUsername());
        user.setEmail(userResponse.getEmail());
        user.setFirstName(userResponse.getFirstName());
        user.setLastName(userResponse.getLastName());
        user.setRole(User.Role.valueOf(userResponse.getRole()));
        user.setIsActive(userResponse.getIsActive());

        return user;
    }
}