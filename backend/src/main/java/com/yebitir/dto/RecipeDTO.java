package com.yebitir.dto;

import com.yebitir.model.Recipe;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Base64;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDTO {
    private Long id;
    private String title;
    private String description;
    private String image; // Base64 encoded string
    private Integer timeInMins;
    private Float rating;
    private Integer servings;
    private RecipeOwnerDTO owner;
    private LocalDateTime dateCreated;
    private String cuisine;
    private String mealType;
    private String diet;
    private String mainIngredient;
    private Integer prepTime;
    private Integer cookTime;
    private List<String> ingredients;
    private List<String> instructions;

    public RecipeDTO(Recipe recipe) {
        this.id = recipe.getId();
        this.title = recipe.getTitle();
        this.description = recipe.getDescription();
        if (recipe.getImage() != null) {
            this.image = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(recipe.getImage());
        }
        this.timeInMins = recipe.getTimeInMins();
        this.rating = recipe.getRating();
        this.servings = recipe.getServings();
        this.owner = new RecipeOwnerDTO(recipe.getOwner());
        this.dateCreated = recipe.getDateCreated();
        this.cuisine = recipe.getCuisine();
        this.mealType = recipe.getMealType();
        this.diet = recipe.getDiet();
        this.mainIngredient = recipe.getMainIngredient();
        this.prepTime = recipe.getPrepTime();
        this.cookTime = recipe.getCookTime();
        this.ingredients = recipe.getIngredients();
        this.instructions = recipe.getInstructions();
    }
}