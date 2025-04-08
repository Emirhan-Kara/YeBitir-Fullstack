package com.yebitir.dto;

import com.yebitir.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Base64;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String bio;
    private String profileImage;
    private LocalDateTime joinDate;
    private String role;
    private int recipesCount;
    private int savedCount;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.bio = user.getBio();

        // Convert byte[] to Base64 string if profile image exists
        if (user.getProfileImage() != null) {
            this.profileImage = Base64.getEncoder().encodeToString(user.getProfileImage());
        }
        this.joinDate = user.getJoinDate();
        this.role = user.getRole().name();
        this.recipesCount = user.getRecipes().size();
        this.savedCount = user.getSavedRecipes().size();
    }
}