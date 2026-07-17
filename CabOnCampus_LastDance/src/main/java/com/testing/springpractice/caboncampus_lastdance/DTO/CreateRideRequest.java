package com.testing.springpractice.caboncampus_lastdance.DTO;

import com.testing.springpractice.caboncampus_lastdance.Models.Location;
import jakarta.validation.constraints.NotNull;
import lombok.*;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CreateRideRequest {
    @NotNull
    private Location pickup;
    @NotNull
    private Location drop;
}
