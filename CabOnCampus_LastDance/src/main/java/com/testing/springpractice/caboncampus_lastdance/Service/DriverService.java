package com.testing.springpractice.caboncampus_lastdance.Service;

import com.testing.springpractice.caboncampus_lastdance.Config.ProjectUtils;
import com.testing.springpractice.caboncampus_lastdance.DTO.DriverProfileDetails;
import com.testing.springpractice.caboncampus_lastdance.DTO.RideDetails;
import com.testing.springpractice.caboncampus_lastdance.DTO.UpdateDriverProfileRequest;
import com.testing.springpractice.caboncampus_lastdance.Models.RideStatus;
import com.testing.springpractice.caboncampus_lastdance.Models.Rides;
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
public class DriverService {

    private final UserRepository userRepository;
    private final RidesRepository ridesRepository;
    private final ProjectUtils projectUtils;
    private final EmailService emailService;

    public DriverService(UserRepository userRepository, RidesRepository ridesRepository, ProjectUtils projectUtils, EmailService emailService) {
        this.userRepository = userRepository;
        this.ridesRepository = ridesRepository;
        this.projectUtils = projectUtils;
        this.emailService = emailService;
    }

    public DriverProfileDetails getMyDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.getDriverProfileDetailsByUsername(username);
    }

    public String updateMyDetails(@Valid UpdateDriverProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        int rows = userRepository.updateDriverDetails(username, request.getPhoneNumber(), request.getVehicleNumber());
        if (rows==0) throw new RuntimeException("Invalid Request");
        return "Updation Successful";
    }

    public List<RideDetails> getPending() {
        return ridesRepository.getRideByStatus(RideStatus.PENDING);
    }

    public String acceptARide(UUID rideId) {
        Users user = projectUtils.getCurrent();
        String student = ridesRepository.getUserByRideId(rideId);
        emailService.sendBooking(user, student);
        int rows = ridesRepository.acceptARide(user, rideId, RideStatus.ACCEPTED, RideStatus.PENDING);
        if (rows==0) throw new RuntimeException("Invalid Request");
        return "Updation Successful";
    }

    public List<RideDetails> getHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ridesRepository.getAllDriverRides(username);
    }

    public RideDetails getRide(UUID rideId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ridesRepository.getDriverRide(rideId, username);

    }
}
