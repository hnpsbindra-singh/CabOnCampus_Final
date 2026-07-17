package com.testing.springpractice.caboncampus_lastdance.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ResetPasswordRequest {
    @NotBlank
    @Email
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@thapar\\.edu$",
            message = "Email must be a valid @thapar.edu email address"
    )
    private String username;
    @NotBlank
    private String otp;
    @NotBlank
    @Size(min = 8, max = 15)
    private String newPassword;
}
