package com.testing.springpractice.caboncampus_lastdance.DTO;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class VerifyEmailRequest {
    private String username;
    private String otp;
}
