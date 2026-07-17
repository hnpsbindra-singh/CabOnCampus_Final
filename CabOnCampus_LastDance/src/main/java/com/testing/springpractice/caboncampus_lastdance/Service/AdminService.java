package com.testing.springpractice.caboncampus_lastdance.Service;

import com.testing.springpractice.caboncampus_lastdance.DTO.CreateProfileRequest;
import com.testing.springpractice.caboncampus_lastdance.DTO.UserDescription;
import com.testing.springpractice.caboncampus_lastdance.Models.Role;
import com.testing.springpractice.caboncampus_lastdance.Models.Users;
import com.testing.springpractice.caboncampus_lastdance.Repository.UserRepository;

import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UserDescription> getAllUsers(Role role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.getUsersAdminView(role, pageable);
    }

    public String addUser(@Valid CreateProfileRequest request) {
        Users users = Users.builder()
                .name(request.getName())
                .username(request.getUsername())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .verified(true)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .vehicleNumber(request.getVehicleNumber())
                .rollNumber(request.getRollNumber())
                .build();
        Users saved = userRepository.save(users);
        return saved.toString();
    }

    public String suspend(UUID userId) {
        int rows = userRepository.suspendUserById(userId);
        if (rows==0) throw new RuntimeException("Invalid UserID or Updation failed");
        return "Updation Successful";
    }

    public String unsuspend(UUID userId) {
        int rows = userRepository.unsuspendUserById(userId);
        if (rows==0) throw new RuntimeException("Invalid UserID or Updation failed");
        return "Updation Successful";
    }
}