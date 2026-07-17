package com.testing.springpractice.caboncampus_lastdance.DTO;

import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class DriverDetails {

    private UUID id;
    private String name;
    private String phoneNumber;
    private String vehicleNumber;

}
