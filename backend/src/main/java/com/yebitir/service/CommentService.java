package com.yebitir.service;

import com.yebitir.exception.ResourceNotFoundException;
import com.yebitir.exception.UnauthorizedException;
import com.yebitir.model.Comment;
import com.yebitir.model.Recipe;
import com.yebitir.model.Role;
import com.yebitir.model.User;
import com.yebitir.repository.CommentRepository;
import com.yebitir.repository.RecipeRepository;
import com.yebitir.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class CommentService {
    private final CommentRepository commentRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository, RecipeRepository recipeRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
    }

    public Comment addComment(Long recipeId, Long userId, String text) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Comment comment = new Comment();
        comment.setAuthor(user);
        comment.setRecipe(recipe);
        comment.setText(text);
        comment.setTime(LocalDateTime.now());
        comment.setLikes(0);
        comment.setDislikes(0);

        return commentRepository.save(comment);
    }

    public Comment updateComment(Long commentId, Long userId, String text) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Only the author or an admin can update a comment
        if (!comment.getAuthor().getId().equals(userId) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to update this comment");
        }

        comment.setText(text);

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByRecipe(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        return commentRepository.findByRecipe(recipe);
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Only the author, recipe owner, or an admin can delete a comment
        if (!comment.getAuthor().getId().equals(userId) &&
                !comment.getRecipe().getOwner().getId().equals(userId) &&
                user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    public Comment likeComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        comment.setLikes(comment.getLikes() + 1);

        return commentRepository.save(comment);
    }

    public Comment dislikeComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        comment.setDislikes(comment.getDislikes() + 1);

        return commentRepository.save(comment);
    }
}