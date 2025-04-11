import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import RecipeCard from './RecipeCard';
import './SearchPage.css';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import { searchRecipes } from '../services/ApiService';
import { cuisineOptions, mealTypeOptions, dietOptions, mainIngredientOptions } from '../constants/recipeOptions';

// Memoized AnimatedFoodIconsBackground component to prevent re-renders
const AnimatedFoodIconsBackground = React.memo(({ count }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <AnimatedFoodIcons count={count} />
    </div>
  );
});

const SearchPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse URL parameters
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search);
    return {
      query: params.get('query') || '',
      minRating: parseFloat(params.get('minRating')) || 0,
      maxCookingTime: parseInt(params.get('maxCookingTime')) || 180,
      cuisine: params.get('cuisine') || '',
      mealType: params.get('mealType') || '',
      diet: params.get('diet') || '',
      mainIngredient: params.get('mainIngredient') || '',
      servings: params.get('servings') || ''
    };
  };
  
  // State for recipes
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for filters
  const [filters, setFilters] = useState(getInitialFilters());
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // Update URL without reloading the page
    navigate(`/recipes?${params.toString()}`, { replace: true });
  }, [filters, navigate]);
  
  // Handle filter changes with debouncing
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle recipe card click to navigate to recipe details
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
    window.scrollTo(0, 0);
  };
  
  // Fetch recipes from backend with debouncing
  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = {
        ...filters
      };
      
      const data = await searchRecipes(searchParams);
      setRecipes(data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipes();
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [filters, fetchRecipes]);
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      query: '',
      minRating: 0,
      maxCookingTime: 180,
      cuisine: '',
      mealType: '',
      diet: '',
      mainIngredient: '',
      servings: ''
    });
  };

  return (
    <div className="search-page-container">
      {/* Filter Section - First Column */}
      <div className="search-filters" style={{ backgroundColor: theme.core.container }}>
        <h2 className="filter-heading" style={{ color: theme.core.text }}>Filter Recipes</h2>
        
        {/* Search Input */}
        <div className="filter-section">
          <label className="filter-label">Search</label>
          <input
            type="text"
            name="query"
            value={filters.query}
            onChange={handleFilterChange}
            className="filter-input"
            placeholder="Search recipes..."
            style={{ backgroundColor: theme.core.containerHoover, color: theme.core.text }}
          />
        </div>

        {/* Rating Filter */}
        <div className="filter-section">
          <label className="filter-label">Minimum Rating</label>
          <div className="filter-slider-container">
            <input
              type="range"
              name="minRating"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={handleFilterChange}
              className="filter-slider"
            />
            <span className="filter-value-badge">{filters.minRating}</span>
          </div>
        </div>

        {/* Cooking Time Filter */}
        <div className="filter-section">
          <label className="filter-label">Maximum Cooking Time (min)</label>
          <div className="filter-slider-container">
            <input
              type="range"
              name="maxCookingTime"
              min="0"
              max="180"
              step="5"
              value={filters.maxCookingTime}
              onChange={handleFilterChange}
              className="filter-slider"
            />
            <span className="filter-value-badge">{filters.maxCookingTime}</span>
          </div>
        </div>

        {/* Cuisine Filter */}
        <div className="filter-section">
          <label className="filter-label">Cuisine</label>
          <select
            name="cuisine"
            value={filters.cuisine}
            onChange={handleFilterChange}
            className="filter-input"
            style={{ backgroundColor: theme.core.containerHoover, color: theme.core.text }}
          >
            <option value="">All Cuisines</option>
            {cuisineOptions.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>

        {/* Meal Type Filter */}
        <div className="filter-section">
          <label className="filter-label">Meal Type</label>
          <select
            name="mealType"
            value={filters.mealType}
            onChange={handleFilterChange}
            className="filter-input"
            style={{ backgroundColor: theme.core.containerHoover, color: theme.core.text }}
          >
            <option value="">All Meal Types</option>
            {mealTypeOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Diet Filter */}
        <div className="filter-section">
          <label className="filter-label">Diet</label>
          <select
            name="diet"
            value={filters.diet}
            onChange={handleFilterChange}
            className="filter-input"
            style={{ backgroundColor: theme.core.containerHoover, color: theme.core.text }}
          >
            <option value="">All Diets</option>
            {dietOptions.map(diet => (
              <option key={diet} value={diet}>{diet}</option>
            ))}
          </select>
        </div>

        {/* Main Ingredient Filter */}
        <div className="filter-section">
          <label className="filter-label">Main Ingredient</label>
          <select
            name="mainIngredient"
            value={filters.mainIngredient}
            onChange={handleFilterChange}
            className="filter-input"
            style={{ backgroundColor: theme.core.containerHoover, color: theme.core.text }}
          >
            <option value="">All Ingredients</option>
            {mainIngredientOptions.map(ingredient => (
              <option key={ingredient} value={ingredient}>{ingredient}</option>
            ))}
          </select>
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={resetFilters}
          className="filter-reset-button"
          style={{ backgroundColor: theme.headerfooter.logoRed, color: 'white' }}
        >
          Reset Filters
        </button>
      </div>

      {/* Recipe Grid - Remaining 3 Columns */}
      <div className="recipe-content">
        {loading ? (
          <div className="loading-state">Loading recipes...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : recipes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-emoji">🍳</span>
            <h3 className="empty-heading">No recipes found</h3>
            <p className="empty-message">Try adjusting your filters or search terms</p>
            <button
              onClick={resetFilters}
              className="empty-reset-button"
              style={{ backgroundColor: theme.headerfooter.logoRed, color: 'white' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="recipe-grid">
            {recipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                image={recipe.image}
                timeInMins={recipe.timeInMins}
                rating={recipe.rating}
                servings={recipe.servings}
                cuisine={recipe.cuisine}
                mealType={recipe.mealType}
                onClick={() => handleRecipeClick(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;