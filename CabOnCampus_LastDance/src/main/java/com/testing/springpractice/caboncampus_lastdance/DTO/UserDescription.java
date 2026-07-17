package com.testing.springpractice.caboncampus_lastdance.DTO;

import com.testing.springpractice.caboncampus_lastdance.Models.Role;
import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserDescription {
    private UUID id;
    private String name;
    private String username;
    private String phoneNumber;
    private Role role;
    private String vehicleNumber;
    private String rollNumber;
}
