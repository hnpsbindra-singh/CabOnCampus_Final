package com.testing.springpractice.caboncampus_lastdance.Config;

import com.testing.springpractice.caboncampus_lastdance.Models.Users;
import com.testing.springpractice.caboncampus_lastdance.Repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public MyUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user =  userRepository.findByUsername(username);
        if (user==null) throw new RuntimeException("User Not Found");
        return user;
    }
}
