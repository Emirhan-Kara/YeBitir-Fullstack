package com.yebitir.controller;

import com.yebitir.dto.CommentDTO;
import com.yebitir.dto.MessageResponse;
import com.yebitir.exception.ResourceNotFoundException;
import com.yebitir.exception.UnauthorizedException;
import com.yebitir.model.Comment;
import com.yebitir.security.services.UserDetailsImpl;
import com.yebitir.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/comments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommentController {
    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/recipe/{recipeId}")
    public ResponseEntity<?> getCommentsByRecipe(@PathVariable Long recipeId) {
        try {
            List<Comment> comments = commentService.getCommentsByRecipe(recipeId);
            List<CommentDTO> commentDTOs = comments.stream()
                    .map(CommentDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(commentDTOs);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/recipe/{recipeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addComment(
            @PathVariable Long recipeId,
            @RequestParam String text,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Comment comment = commentService.addComment(recipeId, userDetails.getId(), text);
            return ResponseEntity.ok(new CommentDTO(comment));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @RequestParam String text,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Comment comment = commentService.updateComment(commentId, userDetails.getId(), text);
            return ResponseEntity.ok(new CommentDTO(comment));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(403).body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            commentService.deleteComment(commentId, userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("Comment deleted successfully"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(403).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<?> likeComment(@PathVariable Long commentId) {
        try {
            Comment comment = commentService.likeComment(commentId);
            return ResponseEntity.ok(new CommentDTO(comment));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{commentId}/dislike")
    public ResponseEntity<?> dislikeComment(@PathVariable Long commentId) {
        try {
            Comment comment = commentService.dislikeComment(commentId);
            return ResponseEntity.ok(new CommentDTO(comment));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}