package com.yebitir.service;

import com.yebitir.exception.EmailAlreadyExistsException;
import com.yebitir.exception.InvalidCredentialsException;
import com.yebitir.exception.ResourceNotFoundException;
import com.yebitir.exception.UsernameAlreadyExistsException;
import com.yebitir.model.Recipe;
import com.yebitir.model.Role;
import com.yebitir.model.User;
import com.yebitir.repository.RecipeRepository;
import com.yebitir.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.yebitir.util.PasswordValidator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RecipeRepository recipeRepository;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            RecipeRepository recipeRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.recipeRepository = recipeRepository;
    }

    public User registerUser(String username, String email, String password, String bio) {
        if (userRepository.existsByUsername(username)) {
            throw new UsernameAlreadyExistsException("Username is already taken");
        }

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email is already registered");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setBio(bio);
        user.setJoinDate(LocalDateTime.now());
        user.setRole(Role.USER);
        user.setActive(true);

        return userRepository.save(user);
    }

    public User updateUser(Long userId, String username, String email, String bio) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if username is being changed and if it's already taken
        if (username != null && !username.equals(user.getUsername()) && userRepository.existsByUsername(username)) {
            throw new UsernameAlreadyExistsException("Username is already taken");
        }

        // Check if email is being changed and if it's already registered
        if (email != null && !email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email is already registered");
        }

        if (username != null)
            user.setUsername(username);
        if (email != null)
            user.setEmail(email);
        if (bio != null)
            user.setBio(bio);

        return userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Check if new password is same as old password
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new InvalidCredentialsException("New password cannot be the same as the current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void saveRecipe(Long userId, Long recipeId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            Recipe recipe = recipeRepository.findById(recipeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

            // Check if recipe is already saved
            if (user.getSavedRecipes().stream().anyMatch(r -> r.getId().equals(recipeId))) {
                return; // Recipe is already saved, silently succeed
            }

            user.getSavedRecipes().add(recipe);
            userRepository.save(user);
        } catch (Exception e) {
            log.error("Error saving recipe {} for user {}: {}", recipeId, userId, e.getMessage());
            throw e;
        }
    }

    public void unsaveRecipe(Long userId, Long recipeId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            Recipe recipe = recipeRepository.findById(recipeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

            // Check if recipe is not saved
            if (user.getSavedRecipes().stream().noneMatch(r -> r.getId().equals(recipeId))) {
                return; // Recipe is not saved, silently succeed
            }

            user.getSavedRecipes().remove(recipe);
            userRepository.save(user);
        } catch (Exception e) {
            log.error("Error unsaving recipe {} for user {}: {}", recipeId, userId, e.getMessage());
            throw e;
        }
    }

    public List<Recipe> getSavedRecipes(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return new ArrayList<>(user.getSavedRecipes());
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        userRepository.delete(user);
    }

    /**
     * Get all users in the system
     * 
     * @return List of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Set a user's active status
     * 
     * @param userId ID of the user to update
     * @param active Boolean indicating whether the user should be active
     * @return The updated User object
     */
    public User setUserActive(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setActive(active);
        return userRepository.save(user);
    }

    public User updateProfilePicture(Long userId, byte[] imageBytes) {
        User user = getUserById(userId);
        user.setProfileImage(imageBytes);
        return userRepository.save(user);
    }

    public boolean isRecipeSaved(Long userId, Long recipeId) {
        try {
            User user = getUserById(userId);
            Recipe recipe = recipeRepository.findById(recipeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

            return user.getSavedRecipes().stream()
                    .anyMatch(savedRecipe -> savedRecipe.getId().equals(recipe.getId()));
        } catch (Exception e) {
            log.error("Error checking if recipe {} is saved for user {}: {}", recipeId, userId, e.getMessage());
            return false;
        }
    }
}