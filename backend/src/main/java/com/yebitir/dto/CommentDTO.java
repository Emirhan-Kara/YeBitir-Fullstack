package com.yebitir.dto;

import com.yebitir.model.Comment;
import com.yebitir.model.UserCommentReaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private Long authorId;
    private String author;
    private String text;
    private String time;
    private Integer likes;
    private Integer dislikes;
    private Boolean userLiked = false;
    private Boolean userDisliked = false;
    private Float rating;

    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.authorId = comment.getAuthor().getId();
        this.author = comment.getAuthor().getUsername();
        this.text = comment.getText();
        this.time = formatTimeAgo(comment.getTime());
        this.likes = comment.getLikes();
        this.dislikes = comment.getDislikes();
        this.rating = comment.getRating();
    }

    public CommentDTO(Comment comment, UserCommentReaction userReaction) {
        this(comment);
        if (userReaction != null) {
            this.userLiked = userReaction.getReactionType() == UserCommentReaction.ReactionType.LIKE;
            this.userDisliked = userReaction.getReactionType() == UserCommentReaction.ReactionType.DISLIKE;
        }
    }

    private String formatTimeAgo(LocalDateTime time) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(time, now);

        if (minutes < 1) {
            return "just now";
        } else if (minutes < 60) {
            return minutes + " minute" + (minutes == 1 ? "" : "s") + " ago";
        } else if (minutes < 1440) { // less than a day
            long hours = minutes / 60;
            return hours + " hour" + (hours == 1 ? "" : "s") + " ago";
        } else {
            long days = minutes / 1440;
            return days + " day" + (days == 1 ? "" : "s") + " ago";
        }
    }
}