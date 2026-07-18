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
    private String username;
    @NotBlank
    private String otp;
    @NotBlank
    @Size(min = 8, max = 15)
    private String newPassword;
}
