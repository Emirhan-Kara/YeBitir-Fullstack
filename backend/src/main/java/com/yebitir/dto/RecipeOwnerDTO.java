package com.yebitir.dto;

import com.yebitir.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Base64;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeOwnerDTO {
    private String username;
    private String profileImage;
    private LocalDateTime joinDate;

    public RecipeOwnerDTO(User user) {
        this.username = user.getUsername();
        if (user.getProfileImage() != null) {
            this.profileImage = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(user.getProfileImage());
        }
        this.joinDate = user.getJoinDate();
    }
}