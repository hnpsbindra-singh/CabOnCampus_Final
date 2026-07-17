package com.testing.springpractice.caboncampus_lastdance.Controllers;

import com.testing.springpractice.caboncampus_lastdance.Config.VerifiedUser;
import com.testing.springpractice.caboncampus_lastdance.DTO.CreateProfileRequest;
import com.testing.springpractice.caboncampus_lastdance.DTO.UserDescription;
import com.testing.springpractice.caboncampus_lastdance.Models.Role;
import com.testing.springpractice.caboncampus_lastdance.Service.AdminService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/user")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    @VerifiedUser
    public Page<UserDescription> getAllUser(@RequestParam Role role,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size){
        return adminService.getAllUsers(role, page, size);
    }
    @PostMapping
    @VerifiedUser
    public String addUser(@RequestBody @Valid CreateProfileRequest request){
        return adminService.addUser(request);
    }

    @PatchMapping("/{userId}/suspend")
    @VerifiedUser
    public String suspend(@PathVariable UUID userId){
        return adminService.suspend(userId);
    }
    @PatchMapping("/{userId}/unsuspend")
    @VerifiedUser
    public String unsuspend(@PathVariable UUID userId){
        return adminService.unsuspend(userId);
    }
}
