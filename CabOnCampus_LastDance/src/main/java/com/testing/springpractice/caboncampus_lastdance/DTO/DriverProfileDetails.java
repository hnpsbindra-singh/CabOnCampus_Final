package com.testing.springpractice.caboncampus_lastdance.DTO;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverProfileDetails {
    private UUID id;
    private String name;
    private String username;
    private String phoneNumber;
    private String vehicleNumber;
}
