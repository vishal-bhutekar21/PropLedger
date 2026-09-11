package com.propledger.controller;

import com.propledger.dto.request.LoginRequest;
import com.propledger.dto.request.RegisterRequest;
import com.propledger.dto.response.AuthResponse;
import com.propledger.dto.response.UserResponse;
import com.propledger.entity.Role;
import com.propledger.entity.User;
import com.propledger.exception.BusinessException;
import com.propledger.exception.DuplicateResourceException;
import com.propledger.repository.RoleRepository;
import com.propledger.repository.UserRepository;
import com.propledger.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "JWT authentication endpoints")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtTokenProvider jwtProvider;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsernameOrEmail(), request.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(auth);

            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String token = jwtProvider.generateToken(userDetails);

            User user = userRepository.findByUsernameOrEmail(
                    request.getUsernameOrEmail(), request.getUsernameOrEmail())
                    .orElseThrow();

            userRepository.updateLastLogin(user.getUserId());

            UserResponse userResp = mapUserToResponse(user);
            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpirationMs / 1000)
                    .user(userResp)
                    .build());
        } catch (BadCredentialsException e) {
            throw new BusinessException("Invalid username/email or password.");
        }
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user (ADMIN only in production)")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered.");
        }

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Role role = roleRepository.findByName(roleName.toUpperCase())
                    .orElseThrow(() -> new BusinessException("Role not found: " + roleName));
            roles.add(role);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(encoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .roles(roles)
                .build();

        user = userRepository.save(user);
        return ResponseEntity.ok(mapUserToResponse(user));
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user profile")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new BusinessException("User not found"));
        return ResponseEntity.ok(mapUserToResponse(user));
    }

    private UserResponse mapUserToResponse(User u) {
        return UserResponse.builder()
                .userId(u.getUserId())
                .username(u.getUsername())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .isActive(u.getIsActive())
                .roles(u.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .lastLogin(u.getLastLogin())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
