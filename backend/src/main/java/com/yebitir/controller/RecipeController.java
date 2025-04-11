package com.yebitir.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yebitir.dto.MessageResponse;
import com.yebitir.dto.RecipeDTO;
import com.yebitir.dto.RecipeFilterDTO;
import com.yebitir.exception.ResourceNotFoundException;
import com.yebitir.exception.UnauthorizedException;
import com.yebitir.model.Recipe;
import com.yebitir.security.services.UserDetailsImpl;
import com.yebitir.service.RecipeService;
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
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/recipes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RecipeController {
    private final RecipeService recipeService;
    private final ObjectMapper objectMapper;

    @Autowired
    public RecipeController(RecipeService recipeService, ObjectMapper objectMapper) {
        this.recipeService = recipeService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<RecipeDTO>> getAllRecipes() {
        List<Recipe> recipes = recipeService.getAllRecipes();
        List<RecipeDTO> recipeDTOs = recipes.stream()
                .map(RecipeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recipeDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRecipeById(@PathVariable Long id) {
        try {
            Recipe recipe = recipeService.getRecipeById(id);
            return ResponseEntity.ok(new RecipeDTO(recipe));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createRecipe(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestPart("recipe") String recipeJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            // Parse recipe JSON with type reference to handle arrays correctly
            RecipeDTO recipeDTO = objectMapper.readValue(recipeJson, RecipeDTO.class);

            // Process image if present
            byte[] imageBytes = null;
            if (image != null && !image.isEmpty()) {
                // Validate file type
                String contentType = image.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Only image files are allowed"));
                }

                // Validate file size (max 5MB)
                if (image.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(new MessageResponse("File size should not exceed 5MB"));
                }

                // Compress image
                imageBytes = compressImage(image.getBytes());
            }

            // Initialize empty lists if they are null
            if (recipeDTO.getIngredients() == null) {
                recipeDTO.setIngredients(new ArrayList<>());
            }
            if (recipeDTO.getInstructions() == null) {
                recipeDTO.setInstructions(new ArrayList<>());
            }

            Recipe recipe = recipeService.createRecipe(userDetails.getId(), recipeDTO, imageBytes);
            return ResponseEntity.ok(new RecipeDTO(recipe));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to process image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("An error occurred: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateRecipe(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestPart("recipe") RecipeDTO recipeDTO,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            byte[] imageBytes = null;
            if (image != null && !image.isEmpty()) {
                // Validate file type
                String contentType = image.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Only image files are allowed"));
                }

                // Validate file size (max 5MB)
                if (image.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(new MessageResponse("File size should not exceed 5MB"));
                }

                // Compress image
                imageBytes = compressImage(image.getBytes());
            }

            Recipe recipe = recipeService.updateRecipe(id, userDetails.getId(), recipeDTO, imageBytes);
            return ResponseEntity.ok(new RecipeDTO(recipe));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to process image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("An error occurred: " + e.getMessage()));
        }
    }

    private byte[] compressImage(byte[] imageBytes) throws IOException {
        // Read the image
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
        if (image == null) {
            throw new IOException("Failed to read image data");
        }

        // Create output stream to store compressed image
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // Get image writers for JPEG format
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new IOException("No image writer found");
        }

        ImageWriter writer = writers.next();
        ImageWriteParam param = writer.getDefaultWriteParam();

        // Set compression quality (0.7 for better quality while maintaining reasonable
        // size)
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(0.7f);

        // Write the image
        writer.setOutput(ImageIO.createImageOutputStream(outputStream));
        writer.write(null, new IIOImage(image, null, null), param);

        // Clean up
        writer.dispose();
        outputStream.close();

        return outputStream.toByteArray();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteRecipe(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            recipeService.deleteRecipe(id, userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("Recipe deleted successfully"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(403).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<RecipeDTO>> searchRecipes(@ModelAttribute RecipeFilterDTO filterDTO) {
        List<Recipe> recipes = recipeService.searchRecipes(filterDTO);
        List<RecipeDTO> recipeDTOs = recipes.stream()
                .map(RecipeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recipeDTOs);
    }

    @PostMapping("/filter")
    public ResponseEntity<List<RecipeDTO>> filterRecipes(@RequestBody RecipeFilterDTO filterDTO) {
        List<Recipe> recipes = recipeService.filterRecipes(filterDTO);
        List<RecipeDTO> recipeDTOs = recipes.stream()
                .map(RecipeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recipeDTOs);
    }

    @PutMapping("/{id}/rating")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateRating(
            @PathVariable Long id,
            @RequestParam Float rating) {
        try {
            Recipe updatedRecipe = recipeService.updateRating(id, rating);
            return ResponseEntity.ok(new RecipeDTO(updatedRecipe));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/suggested")
    public ResponseEntity<List<RecipeDTO>> getSuggestedRecipes() {
        List<Recipe> recipes = recipeService.getSuggestedRecipes();
        List<RecipeDTO> recipeDTOs = recipes.stream()
                .map(RecipeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recipeDTOs);
    }

    @GetMapping("/random")
    public ResponseEntity<List<RecipeDTO>> getRandomRecipes(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long excludeId) {
        System.out.println("Controller - Received excludeId: " + excludeId);
        List<Recipe> recipes = recipeService.getRandomRecipes(limit, excludeId);
        List<RecipeDTO> recipeDTOs = recipes.stream()
                .map(RecipeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recipeDTOs);
    }
}