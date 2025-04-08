package com.yebitir.util;

import com.yebitir.exception.InvalidCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordValidator {

    /**
     * Validates a new password against the current password and password rules
     * 
     * @param currentPassword        The current password
     * @param newPassword            The new password to validate
     * @param encodedCurrentPassword The encoded current password from the database
     * @param passwordEncoder        The password encoder to use for comparison
     * @throws InvalidCredentialsException if validation fails
     */
    public static void validateNewPassword(String currentPassword, String newPassword,
            String encodedCurrentPassword, PasswordEncoder passwordEncoder) {
        // Check if current password is correct
        if (!passwordEncoder.matches(currentPassword, encodedCurrentPassword)) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Check if new password is the same as current password
        if (passwordEncoder.matches(newPassword, encodedCurrentPassword)) {
            throw new InvalidCredentialsException("New password cannot be the same as the current password");
        }

        // Check password length
        if (newPassword.length() < 8) {
            throw new InvalidCredentialsException("Password must be at least 8 characters");
        }

        // Check for at least one number
        if (!newPassword.matches(".*\\d.*")) {
            throw new InvalidCredentialsException("Password must contain at least one number");
        }

        // Check for at least one uppercase letter
        if (!newPassword.matches(".*[A-Z].*")) {
            throw new InvalidCredentialsException("Password must contain at least one uppercase letter");
        }
    }
}