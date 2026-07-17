package com.testing.springpractice.caboncampus_lastdance.DTO;

import com.testing.springpractice.caboncampus_lastdance.Models.Role;
import jakarta.validation.constraints.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CreateProfileRequest {
    @NotBlank
    private String name;
    @NotBlank
    @Email
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
    @NotNull
    private Role role;
    private String vehicleNumber;
    private String rollNumber;
}
