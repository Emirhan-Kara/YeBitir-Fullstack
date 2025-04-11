package com.yebitir.dto;

import com.yebitir.model.Comment;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
public class AdminCommentDTO {
    private Long id;
    private String text;
    private String formattedDate;
    private Integer likes;
    private Integer dislikes;
    private Float rating;
    private boolean reported;
    
    // User info
    private String username;
    
    // Recipe info
    private Long recipeId;
    private String recipeTitle;

    public AdminCommentDTO(Comment comment) {
        this.id = comment.getId();
        this.text = comment.getText();
        
        // Format date nicely
        if (comment.getTime() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            this.formattedDate = comment.getTime().format(formatter);
        } else {
            this.formattedDate = "N/A";
        }
        
        this.likes = comment.getLikes();
        this.dislikes = comment.getDislikes();
        this.rating = comment.getRating();
        this.reported = comment.isReported();
        
        // Handle lazy-loaded relationships safely
        if (comment.getAuthor() != null) {
            this.username = comment.getAuthor().getUsername();
        }
        
        if (comment.getRecipe() != null) {
            this.recipeId = comment.getRecipe().getId();
            this.recipeTitle = comment.getRecipe().getTitle();
        }
    }
} 