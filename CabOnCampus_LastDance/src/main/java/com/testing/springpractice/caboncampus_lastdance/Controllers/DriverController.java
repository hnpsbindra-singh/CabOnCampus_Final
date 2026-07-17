package com.testing.springpractice.caboncampus_lastdance.Controllers;

import com.testing.springpractice.caboncampus_lastdance.Config.VerifiedUser;
import com.testing.springpractice.caboncampus_lastdance.DTO.DriverProfileDetails;
import com.testing.springpractice.caboncampus_lastdance.DTO.RideDetails;
import com.testing.springpractice.caboncampus_lastdance.DTO.UpdateDriverProfileRequest;
import com.testing.springpractice.caboncampus_lastdance.Service.DriverService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/driver")
public class DriverController {
    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping("/me")
    @VerifiedUser
    public DriverProfileDetails getMyDetails(){
        return driverService.getMyDetails();
    }

    @PatchMapping("/me")
    @VerifiedUser
    public String updateMyDetails(@RequestBody @Valid UpdateDriverProfileRequest request){
        return driverService.updateMyDetails(request);
    }

    @GetMapping("/rides/pending")
    @VerifiedUser
    public List<RideDetails> getPendingRides(){
        return driverService.getPending();
    }

    @PatchMapping("/ride/{rideId}/accept")
    @VerifiedUser
    public String acceptARide(@PathVariable UUID rideId){
        return driverService.acceptARide(rideId);
    }

    @GetMapping("/ride/history")
    @VerifiedUser
    public List<RideDetails> getAllRides(){
        return driverService.getHistory();
    }

    @GetMapping("/ride/{rideId}")
    @VerifiedUser
    public RideDetails getRide(@PathVariable UUID rideId){
        return driverService.getRide(rideId);
    }
}
