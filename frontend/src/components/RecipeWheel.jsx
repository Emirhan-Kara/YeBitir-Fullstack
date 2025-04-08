import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeCard from './RecipeCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import { getAllRecipes } from '../services/ApiService';
import './RecipeWheel.css'; // This now contains all our CSS

// Memoized AnimatedFoodIconsBackground component to prevent re-renders
const AnimatedFoodIconsBackground = React.memo(({ count }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <AnimatedFoodIcons count={count} />
    </div>
  );
});

const RecipeWheel = () => {
  const { theme } = useTheme();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  // Refs
  const wheelRef = useRef(null);
  const recipeCardRef = useRef(null);
  
  // States
  const [isSpinning, setIsSpinning] = useState(false);
  const [showRecipe, setShowRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    cuisine: 'Any',
    mealType: 'Any',
    diet: 'Any',
    mainIngredient: 'Any'
  });
  
  // Dummy data for dropdowns
  const filterOptions = {
    cuisine: ["Any", "Turkish", "Italian", "Mexican", "Chinese", "Japanese", "Indian", 
      "French", "Mediterranean", "American", "Thai", "Greek", "Korean",
      "Middle Eastern", "Spanish", "Vietnamese", "Brazilian", "Other"],
    
    mealType: ["Any", "Breakfast", "Brunch", "Lunch", "Dinner", "Appetizer", "Soup", 
      "Salad", "Main Course", "Side Dish", "Dessert", "Snack", "Beverage"],
    
    diet: ["Any", "Regular", "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", 
      "Low-Carb", "Keto", "Paleo", "Halal", "Kosher", "None"],
    
    mainIngredient: ["Any", "Beef", "Chicken", "Pork", "Lamb", "Fish", "Seafood",
      "Eggs", "Tofu", "Beans", "Lentils",
      "Rice", "Pasta", "Bread", "Potatoes",
      "Vegetables", "Mushrooms", "Fruits",
      "Other"]
  };
  
  // Handle input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Reset errors when changing filters
    setError(null);
    
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset selected recipe and wheel when filters change
    setShowRecipe(false);
    setSelectedRecipe(null);
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
  };
  
  // Handle wheel spin
  const handleSpin = async () => {
    if (!isLoggedIn) {
      localStorage.setItem('redirectPath', '/recipe-wheel');
      navigate('/login');
      return;
    }
    
    if (showRecipe) {
      setShowRecipe(false);
      setTimeout(() => {
        spinWheel();
      }, 300);
      return;
    }
    
    await spinWheel();
  };
  
  const spinWheel = async () => {
    setError(null);
    setIsSpinning(true);
    
    if (wheelRef.current) {
      const rotations = 2 + Math.random() * 3;
      const degrees = rotations * 360;
      wheelRef.current.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)';
      wheelRef.current.style.transform = `rotate(${degrees}deg)`;
    }
    
    try {
      // Get all recipes first
      const allRecipes = await getAllRecipes();
      
      if (!allRecipes || allRecipes.length === 0) {
        throw new Error('No recipes available');
      }
      
      // Check if any actual filters are applied
      const hasActiveFilters = Object.values(filters).some(value => value !== 'Any');
      
      // Apply filters client-side
      let filteredRecipes = [...allRecipes];
      
      if (hasActiveFilters) {
        // Apply each filter
        if (filters.cuisine !== 'Any') {
          filteredRecipes = filteredRecipes.filter(recipe => {
            // Deep search for cuisine in multiple possible locations
            if (!recipe) return false;
            const recipeStr = JSON.stringify(recipe).toLowerCase();
            return recipeStr.includes(filters.cuisine.toLowerCase());
          });
        }
        
        if (filters.mealType !== 'Any') {
          filteredRecipes = filteredRecipes.filter(recipe => {
            // Deep search for meal type
            if (!recipe) return false;
            const recipeStr = JSON.stringify(recipe).toLowerCase();
            return recipeStr.includes(filters.mealType.toLowerCase());
          });
        }
        
        if (filters.diet !== 'Any') {
          filteredRecipes = filteredRecipes.filter(recipe => {
            // Deep search for diet
            if (!recipe) return false;
            const recipeStr = JSON.stringify(recipe).toLowerCase();
            return recipeStr.includes(filters.diet.toLowerCase());
          });
        }
        
        if (filters.mainIngredient !== 'Any') {
          filteredRecipes = filteredRecipes.filter(recipe => {
            // Check ingredients
            if (!recipe) return false;
            const recipeStr = JSON.stringify(recipe).toLowerCase();
            return recipeStr.includes(filters.mainIngredient.toLowerCase());
          });
        }
      }
      
      // Wait for the wheel to finish spinning
      setTimeout(() => {
        setIsSpinning(false);
        
        if (filteredRecipes.length > 0) {
          // Select a random recipe from filtered results
          const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
          const matchingRecipe = filteredRecipes[randomIndex];
          
          setSelectedRecipe(matchingRecipe);
          setShowRecipe(true);
          
          setTimeout(() => {
            if (recipeCardRef.current) {
              recipeCardRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center'
              });
            }
          }, 100);
        } else {
          setError('No recipes match your filters. Would you like to add one?');
        }
      }, 3000);
    } catch {
      // Wait for wheel to finish spinning
      setTimeout(() => {
        setIsSpinning(false);
        setError('No recipes match your filters. Would you like to add one?');
      }, 3000);
    }
  };
  
  // Function to navigate to the recipe page
  const viewRecipeDetails = () => {
    if (selectedRecipe) {
      navigate(`/recipe/${selectedRecipe.id}`);
    }
  };
  
  // Wheel segment colors
  const wheelSegments = [
    { color: '#ef4444' }, // Red
    { color: '#f97316' }, // Orange
    { color: '#f59e0b' }, // Amber
    { color: '#84cc16' }, // Lime
    { color: '#10b981' }, // Emerald
    { color: '#06b6d4' }  // Cyan
  ];
  
  return (
    <div 
      className="min-h-screen py-8 px-4 relative overflow-hidden"
      style={{ color: theme.core.text, backgroundColor: theme.core.background }}
    >
      {/* Background with animated food icons - Memoized to prevent re-renders */}
      <AnimatedFoodIconsBackground count={60} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="edgy-title text-center mb-8 spin-in">RECIPE WHEEL</h1>
        <p className="text-xl mb-8 text-center fade-in-up">
          Select your preferences and spin the wheel to discover your next meal!
          {!isLoggedIn && (
            <span className="block text-sm mt-2" style={{ color: theme.headerfooter.logoRed }}>
              (You need to login to spin the wheel)
            </span>
          )}
        </p>
        
        {/* Filter selectors */}
        <div className="filter-container rounded-2xl p-6 mb-8 shadow-lg"
             style={{ backgroundColor: theme.core.container, color: theme.core.text }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cuisine */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Cuisine:</label>
              <select 
                name="cuisine"
                value={filters.cuisine}
                onChange={handleFilterChange}
                className="filter-select p-2 rounded-lg text-gray-900 cursor-pointer"
                style={{ backgroundColor: theme.core.containerHoover}}
                disabled={isSpinning}
              >
                {filterOptions.cuisine.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            {/* Meal Type */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Meal Type:</label>
              <select 
                name="mealType"
                value={filters.mealType}
                onChange={handleFilterChange}
                className="filter-select p-2 rounded-lg text-gray-900 cursor-pointer"
                style={{ backgroundColor: theme.core.containerHoover}}
                disabled={isSpinning}
              >
                {filterOptions.mealType.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            {/* Diet */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Diet:</label>
              <select 
                name="diet"
                value={filters.diet}
                onChange={handleFilterChange}
                className="filter-select p-2 rounded-lg text-gray-900 cursor-pointer"
                style={{ backgroundColor: theme.core.containerHoover}}
                disabled={isSpinning}
              >
                {filterOptions.diet.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            {/* Main Ingredient */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Main Ingredient:</label>
              <select 
                name="mainIngredient"
                value={filters.mainIngredient}
                onChange={handleFilterChange}
                className="filter-select p-2 rounded-lg text-gray-900 cursor-pointer" 
                style={{ backgroundColor: theme.core.containerHoover}}
                disabled={isSpinning}
              >
                {filterOptions.mainIngredient.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Filter feedback */}
          <div className="mt-3 text-center text-sm opacity-80">
            {isSpinning ? (
              "Finding your perfect recipe..."
            ) : error ? (
              <span style={{ color: theme.headerfooter.logoRed }}>{error}</span>
            ) : (
              "Set your preferences and spin the wheel!"
            )}
          </div>
          
          {/* Spin button */}
          <div className="mt-6 flex justify-center">
            <button 
              onClick={handleSpin}
              disabled={isSpinning || !isLoggedIn}
              className={`flame-button cursor-pointer font-bold py-3 px-8 rounded-full text-lg ${!isSpinning && !showRecipe ? 'pulse' : ''}`}
              style={{ 
                backgroundColor: theme.core.containerHoover,
                color: theme.core.text,
                opacity: (isSpinning || !isLoggedIn) ? 0.7 : 1,
                cursor: (!isLoggedIn) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSpinning ? "Spinning..." : showRecipe ? "Spin Again" : "Spin the Wheel"}
            </button>
          </div>
          
          {/* Add Recipe Button */}
          {error && error.includes('No recipes match') && (
            <div className="mt-8 flex justify-center">
              <div className="promotion-container relative p-6 rounded-xl border-4 border-dashed animate-pulse" 
                   style={{ 
                     borderColor: theme.headerfooter.logoRed,
                     backgroundColor: 'rgba(255,255,255,0.1)',
                     maxWidth: '90%',
                     boxShadow: `0 8px 24px rgba(0,0,0,0.2), 0 0 16px ${theme.headerfooter.logoRed}40`
                   }}>
                <div className="flex flex-col items-center text-center">
                  <div className="text-2xl font-bold mb-2" style={{ color: theme.headerfooter.logoRed }}>
                    We Need Your Recipes!
                  </div>
                  <p className="mb-4">
                    Help our community grow by adding your favorite {filters.cuisine !== 'Any' ? filters.cuisine : ''} 
                    {filters.mealType !== 'Any' ? ' ' + filters.mealType : ''} 
                    {filters.diet !== 'Any' ? ' ' + filters.diet : ''} 
                    {filters.mainIngredient !== 'Any' ? ' with ' + filters.mainIngredient : ''} recipes.
                  </p>
                  <button 
                    onClick={() => navigate('/add-recipe')}
                    className="flame-button cursor-pointer font-bold py-3 px-8 rounded-full text-lg transform transition-transform duration-300 hover:scale-110"
                    style={{ 
                      backgroundColor: theme.headerfooter.logoRed,
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">+</span>
                      Add Your Recipe
                    </span>
                  </button>
                </div>
                
                {/* Decorative food emojis */}
                <div className="absolute -top-5 -left-5 text-3xl">🍳</div>
                <div className="absolute -bottom-5 -right-5 text-3xl">🥗</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Wheel and Recipe Display */}
        <div className="wheel-container flex justify-center items-center flex-col">
          {/* Wheel Animation - only show when not displaying a recipe */}
          {!showRecipe && (
            <div className="w-64 h-64 relative mb-8">
              <div 
                ref={wheelRef} 
                className="wheel w-full h-full rounded-full relative overflow-hidden shadow-xl"
                style={{
                  transformOrigin: 'center center',
                  border: `8px solid ${theme.core.text}`,
                  boxShadow: `0 0 20px rgba(0, 0, 0, 0.5), 0 0 30px ${theme.headerfooter.logoRed}40`
                }}
              >
                {/* Colored wheel segments instead of lines */}
                {wheelSegments.map((segment, index) => (
                  <div 
                    key={index}
                    className="wheel-segment absolute w-1/2 h-1/2 top-0 left-1/2"
                    style={{
                      backgroundColor: segment.color,
                      transform: `rotate(${index * 60}deg)`,
                      transformOrigin: 'bottom left',
                      clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                    }}
                  />
                ))}
              </div>
              
              {/* Triangle pointer */}
              <div className="wheel-pointer absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div 
                  className="w-0 h-0"
                  style={{
                    borderLeft: '15px solid transparent',
                    borderRight: '15px solid transparent',
                    borderBottom: `30px solid ${theme.headerfooter.logoRed}`,
                    filter: `drop-shadow(0 0 5px ${theme.headerfooter.logoRed})`
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Recipe Card Display - with zoom in animation when recipe is selected */}
          {showRecipe && selectedRecipe && (
            <div 
              ref={recipeCardRef}
              className="recipe-card-container transition-all duration-500 transform scale-100 hover:scale-105 mb-8 fade-in-up"
            >
              {/* Wrap in larger container for styling and transitions */}
              <div className="recipe-card p-4 rounded-xl shadow-xl" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <RecipeCard
                  title={selectedRecipe.title}
                  image={selectedRecipe.image}
                  timeInMins={selectedRecipe.timeInMins}
                  rating={selectedRecipe.rating}
                  servings={selectedRecipe.servings}
                />
                
                {/* View Details Button */}
                <div className="mt-4 flex justify-center">
                  <button 
                    onClick={viewRecipeDetails}
                    className="recipe-button cursor-pointer py-2 px-6 rounded-lg"
                    style={{
                      backgroundColor: theme.recipecard.component, 
                      color: theme.recipecard.componentText,
                      boxShadow: `0 4px 6px ${theme.headerfooter.logoRed}30`
                    }}
                  >
                    View Recipe Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add background pattern style */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .bg-pattern {
          background-image: radial-gradient(currentColor 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}} />
    </div>
  );
};

export default RecipeWheel;