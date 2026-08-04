package com.retailinventory.retailinventorysystem.controller;

import com.retailinventory.retailinventorysystem.config.AuthRequest;
import com.retailinventory.retailinventorysystem.config.AuthResponse;
import com.retailinventory.retailinventorysystem.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.retailinventory.retailinventorysystem.entity.User;
import com.retailinventory.retailinventorysystem.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.retailinventory.retailinventorysystem.dto.SendOtpRequestDTO;
import com.retailinventory.retailinventorysystem.dto.VerifyOtpRequestDTO;
import com.retailinventory.retailinventorysystem.service.OtpService;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "1. Authentication", description = "Login to obtain a JWT token")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private OtpService otpService;
    @GetMapping("/me")
    public User getCurrentUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    @PostMapping("/send-otp")
    public String sendOtp(@RequestBody SendOtpRequestDTO request) {
        String otp = otpService.generateAndSendOtp(request.getPhone());
        return "OTP sent. (DEV MODE — your OTP is: " + otp + ")";
    }

    @PostMapping("/verify-otp")
    public AuthResponse verifyOtp(@RequestBody VerifyOtpRequestDTO request) {
        boolean valid = otpService.verifyOtp(request.getPhone(), request.getOtp());

        if (!valid) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        User user = userRepository.findByPhone(request.getPhone())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setPhone(request.getPhone());
                    newUser.setUsername(request.getPhone());
                    newUser.setName(request.getName());
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    newUser.setRole("CUSTOMER");
                    return userRepository.save(newUser);
                });

        if ((user.getName() == null || user.getName().isBlank()) && request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = jwtUtil.generateToken(request.getUsername());
        return new AuthResponse(token);
    }
    @PostMapping("/register")
    public String register(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("CUSTOMER");
        userRepository.save(user);

        return "Registration successful. Please log in.";
    }

}