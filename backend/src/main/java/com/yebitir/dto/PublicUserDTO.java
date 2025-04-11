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
public class PublicUserDTO {
    private String username;
    private String bio;
    private String profileImage;
    private LocalDateTime joinDate;
    private int recipesCount;

    public PublicUserDTO(User user) {
        this.username = user.getUsername();
        this.bio = user.getBio();
        if (user.getProfileImage() != null) {
            this.profileImage = Base64.getEncoder().encodeToString(user.getProfileImage());
        }
        this.joinDate = user.getJoinDate();
        this.recipesCount = user.getRecipes().size();
    }
} 