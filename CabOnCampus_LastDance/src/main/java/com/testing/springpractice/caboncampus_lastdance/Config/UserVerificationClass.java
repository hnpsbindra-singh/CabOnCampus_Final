package com.testing.springpractice.caboncampus_lastdance.Config;


import com.testing.springpractice.caboncampus_lastdance.Models.Users;
import com.testing.springpractice.caboncampus_lastdance.Repository.UserRepository;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class UserVerificationClass {
    private final UserRepository userRepo;

    public UserVerificationClass(UserRepository userRepo) {
        this.userRepo = userRepo;
    }
    @Before("@annotation(com.testing.springpractice.caboncampus_lastdance.Config.VerifiedUser)")
    public void checkVerification() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
        if (authentication==null) throw new RuntimeException("No logged in user");
        String username = authentication.getName();
        Users user = userRepo.findByUsername(username);
        if (user==null) throw new RuntimeException("Invalid access");
        if (!user.isVerified()||!user.isEnabled()){
            throw new RuntimeException("User either Banned by admin or Not verified");
        }
    }
}
