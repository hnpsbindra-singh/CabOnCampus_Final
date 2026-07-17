package com.testing.springpractice.caboncampus_lastdance.Controllers;

import com.testing.springpractice.caboncampus_lastdance.DTO.*;
import com.testing.springpractice.caboncampus_lastdance.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest registerRequest){
        return authService.register(registerRequest);
    }
    @PostMapping("/verify")
    public RegisterResponse verify(@RequestBody VerifyEmailRequest verifyEmailRequest){
        return authService.verifyEmail(verifyEmailRequest);
    }
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest loginRequest){
        return authService.login(loginRequest);
    }
    @PostMapping("/send-otp")
    private String sendOtp(@RequestParam String username){
        return authService.sendOtp(username);
    }
    @PutMapping("/verify-otp")
    private String verifyOtp(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest){
        return authService.verifyPassword(resetPasswordRequest);
    }
}
