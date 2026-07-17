package com.testing.springpractice.caboncampus_lastdance.DTO;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class RegisterRequest {

    @NotBlank
    private String name;
    @NotBlank
    @Email
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@thapar\\.edu$",
            message = "Email must be a valid @thapar.edu email address"
    )
    private String username;
    @NotBlank
    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Phone number must contain exactly 10 digits"
    )
    private String phoneNumber;
    @NotBlank
    @Size(min = 8, max = 15)
    private String password;
}
