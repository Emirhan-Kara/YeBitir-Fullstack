package com.yebitir.controller;

import com.yebitir.dto.MessageResponse;
import com.yebitir.dto.RecipeDTO;
import com.yebitir.dto.UserDTO;
import com.yebitir.dto.PublicUserDTO;
import com.yebitir.exception.EmailAlreadyExistsException;
import com.yebitir.exception.InvalidCredentialsException;
import com.yebitir.exception.ResourceNotFoundException;
import com.yebitir.exception.UsernameAlreadyExistsException;
import com.yebitir.model.Recipe;
import com.yebitir.model.User;
import com.yebitir.security.services.UserDetailsImpl;
import com.yebitir.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{username}")
    public ResponseEntity<PublicUserDTO> getUserByUsername(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            return ResponseEntity.ok(new PublicUserDTO(user));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{username}/recipes")
    public ResponseEntity<List<RecipeDTO>> getUserRecipesByUsername(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            List<Recipe> recipes = user.getRecipes();
            List<RecipeDTO> recipeDTOs = recipes.stream()
                    .map(RecipeDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(recipeDTOs);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getCurrentUserProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userService.getUserById(userDetails.getId());
        return ResponseEntity.ok(new UserDTO(user));
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateUserProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody UserDTO userDTO) {
        try {
            User updatedUser = userService.updateUser(
                    userDetails.getId(),
                    userDTO.getUsername(),
                    userDTO.getEmail(),
                    userDTO.getBio());
            return ResponseEntity.ok(new UserDTO(updatedUser));
        } catch (UsernameAlreadyExistsException | EmailAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> passwordData) {
        try {
            userService.changePassword(
                    userDetails.getId(),
                    passwordData.get("oldPassword"),
                    passwordData.get("newPassword"));
            return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
        } catch (InvalidCredentialsException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new MessageResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    @GetMapping("/my-recipes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RecipeDTO>> getUserRecipes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Recipe> recipes = userService.getUserById(userDetails.getId()).getRecipes();
        List<RecipeDTO> recipeDTOs = recipes.stream()
                .map(RecipeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recipeDTOs);
    }

    @GetMapping("/saved-recipes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RecipeDTO>> getSavedRecipes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Recipe> savedRecipes = userService.getSavedRecipes(userDetails.getId());
        List<RecipeDTO> recipeDTOs = savedRecipes.stream()
                .map(RecipeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recipeDTOs);
    }

    @GetMapping("/recipe/{recipeId}/saved")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> isRecipeSaved(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long recipeId) {
        try {
            boolean isSaved = userService.isRecipeSaved(userDetails.getId(), recipeId);
            return ResponseEntity.ok(Map.of("isSaved", isSaved));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.ok(Map.of("isSaved", false));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("isSaved", false));
        }
    }

    @PostMapping("/save-recipe/{recipeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> saveRecipe(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long recipeId) {
        try {
            userService.saveRecipe(userDetails.getId(), recipeId);
            return ResponseEntity.ok(new MessageResponse("Recipe saved successfully"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new MessageResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    @DeleteMapping("/unsave-recipe/{recipeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> unsaveRecipe(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long recipeId) {
        try {
            userService.unsaveRecipe(userDetails.getId(), recipeId);
            return ResponseEntity.ok(new MessageResponse("Recipe unsaved successfully"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new MessageResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete-account")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        userService.deleteUser(userDetails.getId());
        return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
    }

    @PostMapping("/profile/picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfilePicture(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Please select a file to upload"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(new MessageResponse("Only image files are allowed"));
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(new MessageResponse("File size should not exceed 5MB"));
            }

            // Compress image
            byte[] compressedImageBytes = compressImage(file.getBytes());

            User updatedUser = userService.updateProfilePicture(userDetails.getId(), compressedImageBytes);
            return ResponseEntity.ok(new UserDTO(updatedUser));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to process image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new MessageResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    private byte[] compressImage(byte[] imageBytes) throws IOException {
        // Read the image
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));

        // Create output stream to store compressed image
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // Get image writers for JPEG format
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new IOException("No image writer found");
        }

        ImageWriter writer = writers.next();
        ImageWriteParam param = writer.getDefaultWriteParam();

        // Set compression quality
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(0.5f); // 50% quality

        // Write the image
        writer.setOutput(ImageIO.createImageOutputStream(outputStream));
        writer.write(null, new IIOImage(image, null, null), param);

        // Clean up
        writer.dispose();

        return outputStream.toByteArray();
    }
}