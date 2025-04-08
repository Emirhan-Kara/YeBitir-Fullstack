package com.yebitir.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFilterDTO {
    private String query;
    private Float minRating;
    private Integer maxCookingTime;
    private String cuisine;
    private String mealType;
    private String diet;
    private String mainIngredient;
    private Integer servings;
}