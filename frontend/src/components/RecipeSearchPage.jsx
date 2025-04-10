import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import RecipeCard from './RecipeCard';
import { motion } from 'framer-motion';
import { filterRecipes } from '../services/ApiService';

const RecipeSearchPage = () => {
  const { theme } = useTheme();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    minRating: '',
    maxCookingTime: '',
    cuisine: '',
    mealType: '',
    diet: '',
    mainIngredient: '',
    servings: ''
  });

  // Cuisine options (you can expand this list)
  const cuisineOptions = ['Turkish', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'French'];
  const mealTypeOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
  const dietOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low-Carb'];

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        // Only include filters that have values
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        );
        
        const data = await filterRecipes(activeFilters);
        setRecipes(data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the filter requests
    const timeoutId = setTimeout(() => {
      fetchRecipes();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: theme.core.background }}>
      <div className="container mx-auto max-w-7xl">
        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-lg shadow-md"
          style={{ backgroundColor: theme.core.container }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.core.text }}>
            Search Recipes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search by title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: theme.core.text }}>
                Recipe Name
              </label>
              <input
                type="text"
                value={filters.title}
                onChange={(e) => handleFilterChange('title', e.target.value)}
                className="w-full p-2 rounded border"
                style={{ backgroundColor: theme.core.background, color: theme.core.text }}
                placeholder="Search recipes..."
              />
            </div>

            {/* Cuisine dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: theme.core.text }}>
                Cuisine
              </label>
              <select
                value={filters.cuisine}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                className="w-full p-2 rounded border"
                style={{ backgroundColor: theme.core.background, color: theme.core.text }}
              >
                <option value="">All Cuisines</option>
                {cuisineOptions.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* Meal Type dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: theme.core.text }}>
                Meal Type
              </label>
              <select
                value={filters.mealType}
                onChange={(e) => handleFilterChange('mealType', e.target.value)}
                className="w-full p-2 rounded border"
                style={{ backgroundColor: theme.core.background, color: theme.core.text }}
              >
                <option value="">All Meal Types</option>
                {mealTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Diet dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: theme.core.text }}>
                Diet
              </label>
              <select
                value={filters.diet}
                onChange={(e) => handleFilterChange('diet', e.target.value)}
                className="w-full p-2 rounded border"
                style={{ backgroundColor: theme.core.background, color: theme.core.text }}
              >
                <option value="">All Diets</option>
                {dietOptions.map(diet => (
                  <option key={diet} value={diet}>{diet}</option>
                ))}
              </select>
            </div>

            {/* Cooking Time */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: theme.core.text }}>
                Max Cooking Time (minutes)
              </label>
              <input
                type="number"
                value={filters.maxCookingTime}
                onChange={(e) => handleFilterChange('maxCookingTime', e.target.value)}
                className="w-full p-2 rounded border"
                style={{ backgroundColor: theme.core.background, color: theme.core.text }}
                placeholder="e.g., 30"
                min="0"
              />
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: theme.core.text }}>
                Minimum Rating
              </label>
              <input
                type="number"
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full p-2 rounded border"
                style={{ backgroundColor: theme.core.background, color: theme.core.text }}
                placeholder="e.g., 4"
                min="0"
                max="5"
                step="0.5"
              />
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-t-transparent rounded-full" 
                   style={{ borderColor: theme.headerfooter.logoRed, borderTopColor: 'transparent' }}>
              </div>
              <p className="mt-2" style={{ color: theme.core.text }}>Loading recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: theme.core.text }}>No recipes found matching your criteria.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {recipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link to={`/recipe/${recipe.id}`} className="block">
                    <RecipeCard 
                      title={recipe.title}
                      image={recipe.image}
                      timeInMins={recipe.timeInMins}
                      rating={recipe.rating}
                      servings={recipe.servings}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSearchPage; 