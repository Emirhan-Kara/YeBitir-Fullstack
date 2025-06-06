package com.yebitir.controller;

import com.yebitir.dto.CommentDTO;
import com.yebitir.dto.CommentRequest;
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
    public ResponseEntity<?> getCommentsByRecipe(
            @PathVariable Long recipeId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long userId = userDetails != null ? userDetails.getId() : null;
            List<CommentDTO> commentDTOs = commentService.getCommentsByRecipeWithUserReactions(recipeId, userId);

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(commentDTOs);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new MessageResponse("An error occurred while fetching comments: " + e.getMessage()));
        }
    }

    @PostMapping("/recipe/{recipeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addComment(
            @PathVariable Long recipeId,
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
                return ResponseEntity.badRequest().body(new MessageResponse("Rating must be between 1 and 5"));
            }
            Comment comment = commentService.addComment(recipeId, userDetails.getId(), request.getText(),
                    request.getRating());
            return ResponseEntity.ok(new CommentDTO(comment));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> likeComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Comment comment = commentService.likeComment(commentId, userDetails.getId());
            return ResponseEntity.ok(new CommentDTO(comment));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{commentId}/dislike")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> dislikeComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Comment comment = commentService.dislikeComment(commentId, userDetails.getId());
            return ResponseEntity.ok(new CommentDTO(comment));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{commentId}/report")
    public ResponseEntity<?> reportComment(@PathVariable Long commentId) {
        try {
            Comment comment = commentService.getCommentById(commentId);
            if (comment == null) {
                return ResponseEntity.notFound().build();
            }
            
            comment.setReported(true);
            commentService.saveComment(comment);
            
            return ResponseEntity.ok(new MessageResponse("Comment reported successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new MessageResponse("Failed to report comment: " + e.getMessage()));
        }
    }
}