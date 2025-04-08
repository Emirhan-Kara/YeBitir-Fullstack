package com.yebitir.repository;

import com.yebitir.model.Recipe;
import com.yebitir.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByOwner(User owner);

    List<Recipe> findByTitleContainingIgnoreCase(String title);

    List<Recipe> findByCuisine(String cuisine);

    List<Recipe> findByMealType(String mealType);

    List<Recipe> findByDiet(String diet);

    List<Recipe> findByMainIngredient(String mainIngredient);

    @Query("SELECT r FROM Recipe r WHERE " +
            "(:title IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:minRating IS NULL OR r.rating >= :minRating) AND " +
            "(:maxCookingTime IS NULL OR r.timeInMins <= :maxCookingTime) AND " +
            "(:cuisine IS NULL OR r.cuisine = :cuisine) AND " +
            "(:mealType IS NULL OR r.mealType = :mealType) AND " +
            "(:diet IS NULL OR r.diet = :diet) AND " +
            "(:mainIngredient IS NULL OR r.mainIngredient = :mainIngredient) AND " +
            "(:servings IS NULL OR r.servings = :servings)")
    List<Recipe> findByFilters(
            @Param("title") String title,
            @Param("minRating") Float minRating,
            @Param("maxCookingTime") Integer maxCookingTime,
            @Param("cuisine") String cuisine,
            @Param("mealType") String mealType,
            @Param("diet") String diet,
            @Param("mainIngredient") String mainIngredient,
            @Param("servings") Integer servings);
}