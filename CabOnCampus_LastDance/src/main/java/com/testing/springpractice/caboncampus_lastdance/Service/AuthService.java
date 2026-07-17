package com.testing.springpractice.caboncampus_lastdance.Service;

import com.testing.springpractice.caboncampus_lastdance.Config.JwtUtils;
import com.testing.springpractice.caboncampus_lastdance.DTO.*;
import com.testing.springpractice.caboncampus_lastdance.Models.Role;
import com.testing.springpractice.caboncampus_lastdance.Models.Users;
import com.testing.springpractice.caboncampus_lastdance.Repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;


    public AuthService(UserRepository userRepository, RedisTemplate<String, Object> redisTemplate, EmailService emailService, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    public String register(@Valid RegisterRequest request) {
        if (userRepository.existsByUsername((request.getUsername()))) {
            throw new RuntimeException("Email already registered.");
        }
        Random random = new Random();
        String otp = String.valueOf(100000 + random.nextInt(900000));
        redisTemplate.opsForValue().set("otp:"+request.getUsername(),
                otp,
                5,
                TimeUnit.MINUTES);
        redisTemplate.opsForValue().set("register"+request.getUsername(),
                request,
                5,
                TimeUnit.MINUTES);
        emailService.sendOtp(otp, request.getUsername());
        return "Otp Sent";
    }

    public RegisterResponse verifyEmail(VerifyEmailRequest verifyEmailRequest) {
        Object otpObject = redisTemplate.opsForValue()
                .get("otp:" + verifyEmailRequest.getUsername());
        if (otpObject == null) {
            throw new RuntimeException("OTP expired.");
        }
        String storedOtp = otpObject.toString();
        RegisterRequest registerRequest = (RegisterRequest) redisTemplate.opsForValue().get("register" + verifyEmailRequest.getUsername());
        if (storedOtp == null) {
            throw new RuntimeException("OTP expired.");
        }

        if (!storedOtp.equals(verifyEmailRequest.getOtp())) {
            throw new RuntimeException("Invalid OTP.");
        }
        if (registerRequest == null) {
            throw new RuntimeException("Registration expired.");
        }
        Users user = Users.builder()
                .name(registerRequest.getName())
                .username(registerRequest.getUsername())
                .phoneNumber(registerRequest.getPhoneNumber())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(Role.STUDENT)
                .verified(true)
                .enabled(true)
                .build();

        Users saved = userRepository.save(user);
        redisTemplate.delete("otp:"+verifyEmailRequest.getUsername());
        redisTemplate.delete("register"+verifyEmailRequest.getUsername());
        return maptoRegistrationResponse(saved);
    }

    private RegisterResponse maptoRegistrationResponse(Users saved) {
        RegisterResponse response = RegisterResponse.builder()
                 .name(saved.getName())
                .id(saved.getId())
                .password(saved.getPassword())
                .username(saved.getUsername())
                .phoneNumber(saved.getPhoneNumber())
                .build();
        return response;
    }

    public String login(LoginRequest loginRequest) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.username
                ,loginRequest.password));
        Users user = userRepository.findByUsername(loginRequest.getUsername());
        if (user==null) throw new RuntimeException("User doesn't exist");
        if(!user.isVerified()){
            throw new RuntimeException("User not Verified");
        }
        return jwtUtils.generateToken(loginRequest.getUsername(), user.getRole());
    }

    public String sendOtp(String username) {
        System.out.println(username);
        if (!userRepository.existsByUsername(username)) throw new RuntimeException("User Doesn't Exist");
        Random random = new Random();
        String otp = String.valueOf(100000 + random.nextInt(900000));
        redisTemplate.opsForValue().set("username:" + username
                , otp,
                5,
                TimeUnit.MINUTES);
        emailService.sendOtp(otp, username);
        return "Otp Sent Successfully";
    }

    public String verifyPassword(@Valid ResetPasswordRequest resetPasswordRequest) {
        Object object = redisTemplate.opsForValue().get("username:" +resetPasswordRequest.getUsername());
        if (object==null) throw new RuntimeException("Otp Expired");
        String storedOtp = object.toString();
        if (!resetPasswordRequest.getOtp().equals(storedOtp)) throw new RuntimeException("Invalid Otp");
        int rowsAffected = userRepository.updatepasswordForusername(passwordEncoder.encode(resetPasswordRequest.getNewPassword()), resetPasswordRequest.getUsername());

        if (rowsAffected==0) return "password Update failed";
        return "password updated successfully";
    }
}
