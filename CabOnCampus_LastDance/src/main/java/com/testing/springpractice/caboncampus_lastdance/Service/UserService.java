package com.testing.springpractice.caboncampus_lastdance.Service;

import com.testing.springpractice.caboncampus_lastdance.Config.ProjectUtils;
import com.testing.springpractice.caboncampus_lastdance.DTO.*;
import com.testing.springpractice.caboncampus_lastdance.Models.RideStatus;
import com.testing.springpractice.caboncampus_lastdance.Models.Rides;
import com.testing.springpractice.caboncampus_lastdance.Models.Role;
import com.testing.springpractice.caboncampus_lastdance.Models.Users;
import com.testing.springpractice.caboncampus_lastdance.Repository.RidesRepository;
import com.testing.springpractice.caboncampus_lastdance.Repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final ProjectUtils projectUtils;
    private final RidesRepository ridesRepository;

    public UserService(UserRepository userRepository, ProjectUtils projectUtils, RidesRepository ridesRepository) {
        this.userRepository = userRepository;
        this.projectUtils = projectUtils;
        this.ridesRepository = ridesRepository;
    }

    public ProfileResponse getMydetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.selectFields(username);
    }

    public String updateProfile(@Valid UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        int rows = userRepository.updateFields(request.getPhoneNumber(), request.getRollNumber(), username);
        if (rows==0) throw new RuntimeException("Invalid Request");
        return "Updation Successful";
    }

    public List<DriverDetails> getAllDrivers() {
        List<DriverDetails> Drivers = userRepository.getAllUserWithRole(Role.DRIVER);
        return Drivers;
    }

    public String createRideRequest(@Valid CreateRideRequest rideRequest) {
        Users user = projectUtils.getCurrent();
        if (user==null) throw new RuntimeException("Invalid User logged IN");
        Rides rides = Rides.builder()
                .pickup(rideRequest.getPickup())
                .drop(rideRequest.getDrop())
                .student(user)
                .status(RideStatus.PENDING)
                .build();
        ridesRepository.save(rides);
        return "Ride Created Successfully";
    }

    public List<RideDetails> getActiveRides() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ridesRepository.getAllRidesByRideStatus(RideStatus.ACCEPTED, username);
    }


    public List<RideDetails> getCompletedRides() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ridesRepository.getAllRidesByRideStatus(RideStatus.COMPLETED, username);
    }

    public List<RideDetails> getAllRides() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ridesRepository.getAllRides(username);
    }

    public String markAsCompleted(UUID rideId) {
        Rides ride = ridesRepository.findById(rideId).orElseThrow(
                ()-> new RuntimeException("Invalid Ride")
        );
        String username = ride.getStudent().getUsername();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user = authentication.getName();
        if (!user.equals(username)) throw new RuntimeException("Invalid Username");
        if (ride.getStatus() != RideStatus.ACCEPTED) {
            throw new RuntimeException("Ride is not active");
        }
        int rows = ridesRepository.updateRideStatus(rideId, RideStatus.COMPLETED);
        if(rows==0) throw new RuntimeException("Some Error occurred");
        return "Successful";
    }

    public String markAsCancel(UUID rideId) {
        Rides ride = ridesRepository.findById(rideId).orElseThrow(
                ()-> new RuntimeException("Invalid Ride")
        );
        String username = ride.getStudent().getUsername();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String user = authentication.getName();
        if (!user.equals(username)) throw new RuntimeException("Invalid Username");
        if (ride.getStatus() != RideStatus.PENDING) {
            throw new RuntimeException("Ride cannot be cancelled");
        }
        int rows = ridesRepository.updateRideStatus(rideId, RideStatus.CANCELLED);
        if(rows==0) throw new RuntimeException("Some Error occurred");
        return "Successful cancellation";
    }

    public RideDetails getRideById(UUID rideId) {
        Rides ride = ridesRepository.findById(rideId).orElseThrow(
                () -> new RuntimeException("Ride not found")
        );
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        if (!ride.getStudent().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }
        return ridesRepository.getRideById(rideId);
    }
}
