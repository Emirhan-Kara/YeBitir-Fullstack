package com.yebitir.security.services;

import com.yebitir.model.User;
import com.yebitir.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // First try to find by username
        Optional<User> user = userRepository.findByUsername(username);

        // If not found, try to find by email
        if (user.isEmpty()) {
            user = userRepository.findByEmail(username);
        }

        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username or email: " + username);
        }

        return UserDetailsImpl.build(user.get());
    }
}