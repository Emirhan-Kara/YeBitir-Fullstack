package com.yebitir.service;

import com.yebitir.dto.RecipeDTO;
import com.yebitir.dto.RecipeFilterDTO;
import com.yebitir.exception.ResourceNotFoundException;
import com.yebitir.exception.UnauthorizedException;
import com.yebitir.model.Recipe;
import com.yebitir.model.Role;
import com.yebitir.model.User;
import com.yebitir.repository.RecipeRepository;
import com.yebitir.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Autowired
    public RecipeService(RecipeRepository recipeRepository, UserRepository userRepository, UserService userService) {
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public Recipe createRecipe(Long userId, RecipeDTO recipeDTO, byte[] imageBytes) {
        User owner = userService.getUserById(userId);

        Recipe recipe = new Recipe();
        recipe.setTitle(recipeDTO.getTitle());
        recipe.setDescription(recipeDTO.getDescription());
        recipe.setImage(imageBytes);
        recipe.setTimeInMins(recipeDTO.getTimeInMins());
        recipe.setServings(recipeDTO.getServings());
        recipe.setIngredients(recipeDTO.getIngredients());
        recipe.setInstructions(recipeDTO.getInstructions());
        recipe.setCuisine(recipeDTO.getCuisine());
        recipe.setMealType(recipeDTO.getMealType());
        recipe.setDiet(recipeDTO.getDiet());
        recipe.setMainIngredient(recipeDTO.getMainIngredient());
        recipe.setPrepTime(recipeDTO.getPrepTime());
        recipe.setCookTime(recipeDTO.getCookTime());
        recipe.setOwner(owner);
        recipe.setDateCreated(LocalDateTime.now());
        recipe.setRating(0.0f);

        return recipeRepository.save(recipe);
    }

    public Recipe updateRecipe(Long recipeId, Long userId, RecipeDTO recipeDTO, byte[] imageBytes) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        // Check if the user is the owner of the recipe
        if (!recipe.getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to update this recipe");
        }

        recipe.setTitle(recipeDTO.getTitle());
        recipe.setDescription(recipeDTO.getDescription());
        if (imageBytes != null) {
            recipe.setImage(imageBytes);
        }
        recipe.setTimeInMins(recipeDTO.getTimeInMins());
        recipe.setServings(recipeDTO.getServings());
        recipe.setIngredients(recipeDTO.getIngredients());
        recipe.setInstructions(recipeDTO.getInstructions());
        recipe.setCuisine(recipeDTO.getCuisine());
        recipe.setMealType(recipeDTO.getMealType());
        recipe.setUpdatedAt(LocalDateTime.now());

        return recipeRepository.save(recipe);
    }

    public Recipe getRecipeById(Long recipeId) {
        return recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));
    }

    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    public List<Recipe> getRecipesByOwner(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return recipeRepository.findByOwner(user);
    }

    public List<Recipe> searchRecipes(RecipeFilterDTO filterDTO) {
        return recipeRepository.findByFilters(
            filterDTO.getQuery(),
            filterDTO.getMinRating(),
            filterDTO.getMaxCookingTime(),
            filterDTO.getCuisine(),
            filterDTO.getMealType(),
            filterDTO.getDiet(),
            filterDTO.getMainIngredient(),
            filterDTO.getServings()
        );
    }

    public List<Recipe> searchRecipesByCookingTime(Integer maxCookingTime) {
        return recipeRepository.findByTimeInMinsLessThanEqual(maxCookingTime);
    }

    public List<Recipe> filterRecipes(RecipeFilterDTO filterDTO) {
        return recipeRepository.findByFilters(
                filterDTO.getQuery(),
                filterDTO.getMinRating(),
                filterDTO.getMaxCookingTime(),
                filterDTO.getCuisine(),
                filterDTO.getMealType(),
                filterDTO.getDiet(),
                filterDTO.getMainIngredient(),
                filterDTO.getServings());
    }

    public void deleteRecipe(Long recipeId, Long userId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Only the owner or an admin can delete a recipe
        if (!recipe.getOwner().getId().equals(userId) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to delete this recipe");
        }

        recipeRepository.delete(recipe);
    }

    public Recipe updateRating(Long recipeId, Float rating) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        // In a real application, you would calculate an average based on user ratings
        recipe.setRating(rating);

        return recipeRepository.save(recipe);
    }

    public List<Recipe> getSuggestedRecipes() {
        // Get top rated recipes, limited to 6
        return recipeRepository.findAll().stream()
                .sorted((r1, r2) -> Float.compare(r2.getRating(), r1.getRating()))
                .limit(6)
                .collect(Collectors.toList());
    }

    public List<Recipe> getRandomRecipes(int limit, Long excludeId) {
        System.out.println("Service - Received excludeId: " + excludeId);
        if (excludeId != null) {
            System.out.println("Service - Calling findRandomRecipesExcluding with excludeId: " + excludeId);
            // Execute debug query first
            String debugInfo = recipeRepository.debugQuery(limit, excludeId);
            System.out.println("Repository - " + debugInfo);
            return recipeRepository.findRandomRecipesExcluding(limit, excludeId);
        }
        return recipeRepository.findRandomRecipes(limit);
    }
}