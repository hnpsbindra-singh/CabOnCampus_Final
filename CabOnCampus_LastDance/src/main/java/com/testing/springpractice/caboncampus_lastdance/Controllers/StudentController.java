package com.testing.springpractice.caboncampus_lastdance.Controllers;

import com.testing.springpractice.caboncampus_lastdance.Config.VerifiedUser;
import com.testing.springpractice.caboncampus_lastdance.DTO.*;
import com.testing.springpractice.caboncampus_lastdance.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    private final UserService userService;

    public StudentController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @VerifiedUser
    public ProfileResponse getMyDetails(){
        return userService.getMydetails();
    }
    @PostMapping("/me")
    @VerifiedUser
    public String Update(@Valid  @RequestBody UpdateProfileRequest request){
        return userService.updateProfile(request);
    }
    @GetMapping("/drivers")
    @VerifiedUser
    public List<DriverDetails> getAllDrivers(){
        return userService.getAllDrivers();
    }

    @PostMapping("/create-New-Ride")
    @VerifiedUser
    public String CreateRideRequest(@Valid @RequestBody CreateRideRequest rideRequest){
        return userService.createRideRequest(rideRequest);
    }
    @GetMapping("/ride/current")
    @VerifiedUser
    public List<RideDetails> getActiveRides(){
        return userService.getActiveRides();
    }

    @GetMapping("/ride/completed")
    @VerifiedUser
    public List<RideDetails> getCompletedRides(){
        return userService.getCompletedRides();
    }

    @GetMapping("/ride/history")
    @VerifiedUser
    public List<RideDetails> getAllRides(){
        return userService.getAllRides();
    }

    @PatchMapping("/ride/complete/{rideId}")
    @VerifiedUser
    public String markAsCompleted(@PathVariable UUID rideId){
        return userService.markAsCompleted(rideId);
    }

    @PatchMapping("/ride/cancel/{rideId}")
    @VerifiedUser
    public String markAsCancel(@PathVariable UUID rideId){
        return userService.markAsCancel(rideId);
    }

    @GetMapping("/ride/{rideId}")
    @VerifiedUser
    public RideDetails getRideById(@PathVariable UUID rideId){
        return userService.getRideById(rideId);
    }

}
