package com.testing.springpractice.caboncampus_lastdance.DTO;

import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class RegisterResponse {
    private UUID id;
    private String name;
    private String username;
    private String phoneNumber;
    private String password;
}
