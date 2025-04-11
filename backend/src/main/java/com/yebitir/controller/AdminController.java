package com.yebitir.controller;

import com.yebitir.dto.MessageResponse;
import com.yebitir.dto.RecipeDTO;
import com.yebitir.dto.UserDTO;
import com.yebitir.dto.AdminCommentDTO;
import com.yebitir.exception.ResourceNotFoundException;
import com.yebitir.model.Recipe;
import com.yebitir.model.User;
import com.yebitir.model.Comment;
import com.yebitir.service.RecipeService;
import com.yebitir.service.UserService;
import com.yebitir.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserService userService;
    private final RecipeService recipeService;
    private final CommentService commentService;

    @Autowired
    public AdminController(UserService userService, RecipeService recipeService, CommentService commentService) {
        this.userService = userService;
        this.recipeService = recipeService;
        this.commentService = commentService;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            // Get current logged in username
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            List<User> users = userService.getAllUsers();
            
            List<Map<String, Object>> userDTOs = users.stream()
                .filter(user -> !user.getUsername().equals(currentUsername)) // Filter out the logged-in admin
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("join_date", user.getJoinDate());
                    userMap.put("role", user.getRole().name());
                    return userMap;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            System.err.println("AdminController: Error fetching users - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Failed to fetch users: " + e.getMessage()));
        }
    }

    @GetMapping("/recipes")
    public ResponseEntity<List<RecipeDTO>> getAllRecipes() {
        List<Recipe> recipes = recipeService.getAllRecipes();
        List<RecipeDTO> recipeDTOs = recipes.stream()
                .map(RecipeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recipeDTOs);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Failed to delete user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/recipes/{recipeId}")
    public ResponseEntity<?> deleteRecipe(@PathVariable Long recipeId) {
        try {
            Recipe recipe = recipeService.getRecipeById(recipeId);
            recipeService.deleteRecipe(recipeId, recipe.getOwner().getId());
            return ResponseEntity.ok(new MessageResponse("Recipe deleted successfully"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Failed to delete recipe: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long userId) {
        try {
            userService.setUserActive(userId, true);
            return ResponseEntity.ok(new MessageResponse("User activated successfully"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/users/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId) {
        try {
            userService.setUserActive(userId, false);
            return ResponseEntity.ok(new MessageResponse("User deactivated successfully"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/recipes/stats")
    public ResponseEntity<?> getRecipeStats() {
        try {
            List<Recipe> allRecipes = recipeService.getAllRecipes();
            long total = allRecipes.size();
            long published = allRecipes.stream().filter(Recipe::getActive).count();
            long pending = total - published;
            
            Map<String, Long> stats = Map.of(
                    "total", total,
                    "published", published,
                    "pending", pending
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to get recipe statistics: " + e.getMessage()));
        }
    }

    @PutMapping("/recipes/{recipeId}/status")
    public ResponseEntity<?> updateRecipeStatus(
            @PathVariable Long recipeId,
            @RequestBody Map<String, Boolean> status) {
        try {
            Recipe recipe = recipeService.getRecipeById(recipeId);
            recipe.setActive(status.get("active"));
            recipeService.saveRecipe(recipe);
            return ResponseEntity.ok(new MessageResponse("Recipe status updated successfully"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Failed to update recipe status: " + e.getMessage()));
        }
    }

    @GetMapping("/comments")
    public ResponseEntity<List<AdminCommentDTO>> getAllComments() {
        try {
            List<Comment> comments = commentService.getAllComments();
            List<AdminCommentDTO> commentDTOs = comments.stream()
                .map(AdminCommentDTO::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(commentDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/comments/{commentId}/clear-report")
    public ResponseEntity<?> clearReportedComment(@PathVariable Long commentId) {
        try {
            commentService.clearReportedComment(commentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        try {
            commentService.deleteComment(commentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}