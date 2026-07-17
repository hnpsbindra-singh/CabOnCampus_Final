package com.testing.springpractice.caboncampus_lastdance.DTO;

import com.testing.springpractice.caboncampus_lastdance.Models.Location;

import com.testing.springpractice.caboncampus_lastdance.Models.RideStatus;
import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class RideDetails {
    private UUID rideId;
    private UUID driverId;
    private Location pickup;
    private Location drop;
    private String name;
    private String phoneNumber;
    private String vehicleNumber;
    private RideStatus status;
}
