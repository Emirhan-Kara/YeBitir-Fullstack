import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import RecipeCard from './RecipeCard';
import './SearchPage.css';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import { searchRecipes } from '../services/ApiService';

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
  
  // State for recipes
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for filters
  const [filters, setFilters] = useState({
    query: '',
    minRating: 0,
    maxCookingTime: 180,
    cuisine: '',
    mealType: '',
    diet: '',
    mainIngredient: '',
    servings: ''
  });
  
  // Options for dropdowns (copied from AddRecipePage.jsx)
  const cuisineOptions = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 
    'French', 'Mediterranean', 'American', 'Thai', 'Greek', 'Other'
  ];
  
  const mealTypeOptions = [
    'Breakfast', 'Lunch', 'Dinner', 'Appetizer', 'Soup', 
    'Salad', 'Main Course', 'Side Dish', 'Dessert', 'Snack', 'Drink'
  ];
  
  const dietOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Low-Carb', 'Keto', 'Paleo', 'Whole30', 'None'
  ];

  const mainIngredientOptions = [
    'Chicken', 'Beef', 'Pork', 'Fish', 'Seafood', 'Tofu', 
    'Beans', 'Vegetables', 'Pasta', 'Rice', 'Other'
  ];
  
  // Handle filter changes
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
  
  // Fetch recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
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
    };

    fetchRecipes();
  }, [filters]);
  
  // Render filter section
  const renderFilters = () => (
    <div 
      className="search-filters"
      style={{ backgroundColor: theme.core.container, color: theme.core.text }}
    >
      <h2 className="filter-heading">Filter Recipes</h2>
      
      {/* Search Input */}
      <div className="filter-section">
        <label className="filter-label">Search</label>
        <input
          type="text"
          name="query"
          value={filters.query}
          onChange={handleFilterChange}
          className="border-2 filter-input"
          placeholder="Search recipes..."
          style={{ 
            borderColor: theme.core.text,
            backgroundColor: theme.headerfooter.searchBox || 'rgba(255,255,255,0.1)',
            color: theme.core.text
          }}
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
          <span className="filter-value-badge" style={{ backgroundColor: theme.core.containerHoover }}>
            {filters.minRating} ★
          </span>
        </div>
      </div>
      
      {/* Cooking Time Filter */}
      <div className="filter-section">
        <label className="filter-label">Maximum Cooking Time</label>
        <div className="filter-slider-container">
          <input
            type="range"
            name="maxCookingTime"
            min="10"
            max="180"
            step="10"
            value={filters.maxCookingTime}
            onChange={handleFilterChange}
            className="filter-slider"
          />
          <span className="filter-value-badge" style={{ backgroundColor: theme.core.containerHoover }}>
            {filters.maxCookingTime} min
          </span>
        </div>
      </div>
      
      {/* Cuisine Filter */}
      <div className="filter-section">
        <label className="filter-label">Cuisine</label>
        <select
          name="cuisine"
          value={filters.cuisine}
          onChange={handleFilterChange}
          className="border-2 filter-input"
          style={{ 
            borderColor: theme.core.text,
            backgroundColor: theme.headerfooter.searchBox || 'rgba(255,255,255,0.1)',
          }}
        >
          <option value="">All Cuisines</option>
          {cuisineOptions.map(option => (
            <option key={option} value={option} style={{ color: theme.headerfooter.logoRed || "#c0392b" }}>
              {option}
            </option>
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
          className="border-2 filter-input"
          style={{ 
            borderColor: theme.core.text,
            backgroundColor: theme.headerfooter.searchBox || 'rgba(255,255,255,0.1)'
          }}
        >
          <option value="">All Meal Types</option>
          {mealTypeOptions.map(option => (
            <option key={option} value={option} style={{ color: theme.headerfooter.logoRed || "#c0392b" }}>
              {option}
            </option>
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
          className="border-2 filter-input"
          style={{ 
            borderColor: theme.core.text,
            backgroundColor: theme.headerfooter.searchBox || 'rgba(255,255,255,0.1)'
          }}
        >
          <option value="">All Diets</option>
          {dietOptions.map(option => (
            <option key={option} value={option} style={{ color: theme.headerfooter.logoRed || "#c0392b" }}>
              {option}
            </option>
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
          className="border-2 filter-input"
          style={{ 
            borderColor: theme.core.text,
            backgroundColor: theme.headerfooter.searchBox || 'rgba(255,255,255,0.1)'
          }}
        >
          <option value="">All Ingredients</option>
          {mainIngredientOptions.map(option => (
            <option key={option} value={option} style={{ color: theme.headerfooter.logoRed || "#c0392b" }}>
              {option}
            </option>
          ))}
        </select>
      </div>
      
      {/* Servings Filter */}
      <div className="filter-section">
        <label className="filter-label">Servings</label>
        <select
          name="servings"
          value={filters.servings}
          onChange={handleFilterChange}
          className="border-2 filter-input"
          style={{ 
            borderColor: theme.core.text,
            backgroundColor: theme.headerfooter.searchBox || 'rgba(255,255,255,0.1)'
          }}
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(count => (
            <option key={count} value={count} style={{ color: theme.headerfooter.logoRed || "#c0392b" }}>
              {count}
            </option>
          ))}
        </select>
      </div>
      
      {/* Reset Filters Button */}
      <button
        onClick={() => setFilters({
          query: '',
          minRating: 0,
          maxCookingTime: 180,
          cuisine: '',
          mealType: '',
          diet: '',
          mainIngredient: '',
          servings: ''
        })}
        className="filter-reset-button"
        style={{ 
          backgroundColor: theme.headerfooter.logoRed || "#c0392b",
          color: 'white',
          borderColor: theme.core.text
        }}
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: theme.core.background, color: theme.core.text }}>
      {/* Background with animated food icons */}
      <AnimatedFoodIconsBackground count={60} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Search Header */}
        <div 
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Search Recipes</h1>
          <p className="text-lg opacity-80">Find your perfect recipe with our advanced search filters</p>
        </div>

        {/* Filters Section */}
        <div 
          className="mb-8"
        >
          {renderFilters()}
        </div>

        {/* Results Section */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: theme.headerfooter.logoRed }}></div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12 text-red-500">
              {error}
            </div>
          ) : recipes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              No recipes found matching your criteria.
            </div>
          ) : (
            recipes.map(recipe => (
              <div
                key={recipe.id}
                className="cursor-pointer"
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <RecipeCard
                  title={recipe.title}
                  image={recipe.image}
                  timeInMins={recipe.timeInMins}
                  rating={recipe.rating}
                  servings={recipe.servings}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;