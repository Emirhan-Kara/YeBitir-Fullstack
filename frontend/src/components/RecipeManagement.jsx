import React, { useState } from 'react';
import { Eye, Edit, Trash2, Check, X, Search, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const RecipeManagement = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Mock data for recipes
  const [recipes, setRecipes] = useState([
    { 
      id: 1, 
      title: 'Homemade Turkish Lahmacun', 
      author: 'Emirhan', 
      category: 'Main Course',
      status: 'published', 
      date: '2025-03-04', 
      views: 142,
      likes: 37,
      featured: true
    },
    { 
      id: 2, 
      title: 'Authentic Adana Kebab', 
      author: 'Hayrunnisa', 
      category: 'Main Course',
      status: 'published', 
      date: '2025-03-03', 
      views: 89,
      likes: 22,
      featured: false
    },
    { 
      id: 3, 
      title: 'Classic Turkish Baklava', 
      author: 'Rumeysa', 
      category: 'Desserts',
      status: 'pending', 
      date: '2025-03-05', 
      views: 0,
      likes: 0,
      featured: false
    },
    { 
      id: 4, 
      title: 'Spicy Chicken Köfte', 
      author: 'Zaid', 
      category: 'Main Course',
      status: 'published', 
      date: '2025-03-02', 
      views: 215,
      likes: 54,
      featured: true
    },
    { 
      id: 5, 
      title: 'Quick Breakfast Menemen', 
      author: 'CookingMaster', 
      category: 'Breakfast',
      status: 'pending', 
      date: '2025-03-05', 
      views: 0,
      likes: 0,
      featured: false
    },
    { 
      id: 6, 
      title: 'Creamy Mushroom Soup', 
      author: 'ZeynepKaya', 
      category: 'Soups',
      status: 'published', 
      date: '2025-03-05', 
      views: 56,
      likes: 14,
      featured: false
    },
    { 
      id: 7, 
      title: 'Easy Turkish Rice Pudding', 
      author: 'AhmetYilmaz', 
      category: 'Desserts',
      status: 'published', 
      date: '2025-03-01', 
      views: 122,
      likes: 41,
      featured: false
    },
    { 
      id: 8, 
      title: 'Mediterranean Chickpea Salad', 
      author: 'MerveDeniz', 
      category: 'Salads',
      status: 'published', 
      date: '2025-03-04', 
      views: 78,
      likes: 19,
      featured: false
    },
    { 
      id: 9, 
      title: 'Traditional Turkish Coffee', 
      author: 'EmreAksoy', 
      category: 'Beverages',
      status: 'pending', 
      date: '2025-03-06', 
      views: 0,
      likes: 0,
      featured: false
    }
  ]);

  // Categories for filtering
  const categories = [
    'All Categories',
    'Main Course',
    'Desserts',
    'Breakfast',
    'Appetizers',
    'Soups',
    'Salads',
    'Beverages'
  ];

  // Default theme values in case theme is not properly loaded
  const isDark = theme?.name === 'dark';
  
  const themeColors = {
    primary: isDark ? '#e53e3e' : '#e53e3e', // Keep the same red for both themes
    secondary: isDark ? '#2d3748' : '#4a5568',
    background: isDark ? '#1a202c' : '#f7fafc',
    text: {
      primary: isDark ? '#f7fafc' : '#1a202c',
      secondary: isDark ? '#a0aec0' : '#4a5568'
    },
    card: isDark ? '#2d3748' : 'white',
    table: {
      header: isDark ? '#1e2533' : '#f9fafb',
      row: isDark ? '#2d3748' : 'white',
      hover: isDark ? '#3a4556' : '#f7fafc'
    }
  };

  // Filter recipes based on search, status filter, and category filter
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          recipe.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatusFilter = filterStatus === 'all' || recipe.status === filterStatus;
    const matchesCategoryFilter = filterCategory === 'all' || 
                                  recipe.category.toLowerCase() === filterCategory.toLowerCase();
    
    return matchesSearch && matchesStatusFilter && matchesCategoryFilter;
  });

  // View recipe details - Navigate to recipe page
  const viewRecipe = (recipeId) => {
    // In a real application, this would navigate to the recipe detail page
    navigate(`/recipe/${recipeId}`);
  };

  // Approve a pending recipe
  const approveRecipe = (recipeId, e) => {
    e.stopPropagation(); // Prevent row click event
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, status: 'published' } 
          : recipe
      )
    );
  };

  // Reject a pending recipe
  const rejectRecipe = (recipeId, e) => {
    e.stopPropagation(); // Prevent row click event
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, status: 'rejected' } 
          : recipe
      )
    );
  };

  // Toggle featured status
  const toggleFeatured = (recipeId, e) => {
    e.stopPropagation(); // Prevent row click event
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, featured: !recipe.featured } 
          : recipe
      )
    );
  };

  // Edit recipe
  const editRecipe = (recipeId, e) => {
    e.stopPropagation(); // Prevent row click event
    navigate(`/admin/recipes/edit/${recipeId}`);
  };

  // Delete recipe
  const deleteRecipe = (recipeId, e) => {
    e.stopPropagation(); // Prevent row click event
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
    }
  };

  return (
    <AdminLayout 
      pageTitle="Recipe Management" 
      pageDescription="Manage recipes and recipe submissions"
    >
      {/* Recipe Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Total Recipes</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>248</p>
        </div>
        
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Published</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>230</p>
        </div>
        
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Pending</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>18</p>
        </div>
        
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Featured</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>12</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5" style={{ color: themeColors.text.secondary }} />
          </div>
          <input
            type="text"
            placeholder="Search recipes by title or author..."
            className="pl-10 pr-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ 
              backgroundColor: isDark ? '#3a4556' : 'white',
              color: themeColors.text.primary,
              borderColor: isDark ? '#4a5568' : '#e2e8f0',
              focusRing: themeColors.primary
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5" style={{ color: themeColors.text.secondary }} />
          </div>
          <select
            className="pl-10 pr-8 py-2 rounded-md w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-opacity-50 appearance-none"
            style={{ 
              backgroundColor: isDark ? '#3a4556' : 'white',
              color: themeColors.text.primary,
              borderColor: isDark ? '#4a5568' : '#e2e8f0',
              focusRing: themeColors.primary
            }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg className="h-4 w-4" style={{ color: themeColors.text.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="relative w-full md:w-auto">
          <select
            className="pl-4 pr-8 py-2 rounded-md w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-opacity-50 appearance-none"
            style={{ 
              backgroundColor: isDark ? '#3a4556' : 'white',
              color: themeColors.text.primary,
              borderColor: isDark ? '#4a5568' : '#e2e8f0',
              focusRing: themeColors.primary
            }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value.toLowerCase())}
          >
            {categories.map((category, index) => (
              <option key={index} value={index === 0 ? 'all' : category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg className="h-4 w-4" style={{ color: themeColors.text.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recipes Table */}
      <div className="rounded-lg shadow mb-8" style={{ 
        backgroundColor: themeColors.card,
      }}>
        <div className="px-6 py-4 border-b" style={{ 
          borderColor: isDark ? '#3a4556' : '#e2e8f0' 
        }}>
          <h2 style={{ color: themeColors.text.primary }} className="font-semibold">Recipes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left" style={{ 
                backgroundColor: themeColors.table.header,
              }}>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Title</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Author</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Category</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Status</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Date</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Views</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Likes</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Featured</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ 
              borderColor: isDark ? '#3a4556' : '#e2e8f0' 
            }}>
              {filteredRecipes.map(recipe => (
                <tr 
                  key={recipe.id} 
                  style={{ backgroundColor: themeColors.table.row }}
                  className="hover:bg-opacity-80 cursor-pointer"
                  onClick={() => viewRecipe(recipe.id)}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = themeColors.table.hover}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = themeColors.table.row}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium" style={{ color: themeColors.text.primary }}>{recipe.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{recipe.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{recipe.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      recipe.status === 'published' 
                        ? isDark ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'
                        : recipe.status === 'pending'
                          ? isDark ? 'bg-yellow-900 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                          : isDark ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'
                    }`}>
                      {recipe.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{recipe.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{recipe.views}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{recipe.likes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => toggleFeatured(recipe.id, e)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        recipe.featured
                          ? isDark ? 'bg-purple-900 text-purple-100' : 'bg-purple-100 text-purple-800'
                          : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {recipe.featured ? 'Featured' : 'Not Featured'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 rounded hover:bg-opacity-80"
                        style={{ backgroundColor: isDark ? '#3a4556' : '#e2e8f0' }}
                        title="View Recipe"
                        onClick={(e) => viewRecipe(recipe.id)}
                      >
                        <Eye className="h-4 w-4" style={{ color: themeColors.text.primary }} />
                      </button>
                      {recipe.status === 'pending' && (
                        <>
                          <button 
                            className="p-1 rounded hover:bg-opacity-80"
                            style={{ backgroundColor: isDark ? '#285e28' : '#d1ffd1' }}
                            title="Approve Recipe"
                            onClick={(e) => approveRecipe(recipe.id, e)}
                          >
                            <Check className="h-4 w-4" style={{ color: isDark ? '#4ade4a' : '#22c55e' }} />
                          </button>
                          <button 
                            className="p-1 rounded hover:bg-opacity-80"
                            style={{ backgroundColor: isDark ? '#5e2828' : '#ffd1d1' }}
                            title="Reject Recipe"
                            onClick={(e) => rejectRecipe(recipe.id, e)}
                          >
                            <X className="h-4 w-4" style={{ color: isDark ? '#de4a4a' : '#ef4444' }} />
                          </button>
                        </>
                      )}
                      <button 
                        className="p-1 rounded hover:bg-opacity-80"
                        style={{ backgroundColor: isDark ? '#3a4556' : '#e2e8f0' }}
                        title="Delete Recipe"
                        onClick={(e) => deleteRecipe(recipe.id, e)}
                      >
                        <Trash2 className="h-4 w-4" style={{ color: themeColors.text.primary }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Recipes Section */}
      <div className="rounded-lg shadow mb-6" style={{ 
        backgroundColor: themeColors.card,
      }}>
        <div className="px-6 py-4 border-b" style={{ 
          borderColor: isDark ? '#3a4556' : '#e2e8f0' 
        }}>
          <h2 style={{ color: themeColors.text.primary }} className="font-semibold">Pending Approval</h2>
        </div>
        <div className="p-6">
          {recipes.filter(recipe => recipe.status === 'pending').length === 0 ? (
            <p style={{ color: themeColors.text.secondary }} className="text-center py-4">No recipes waiting for approval</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes
                .filter(recipe => recipe.status === 'pending')
                .map(recipe => (
                  <div 
                    key={recipe.id} 
                    className="border rounded-lg p-4 cursor-pointer hover:brightness-90 transition-all"
                    style={{ 
                      backgroundColor: isDark ? '#3a4556' : 'white',
                      borderColor: isDark ? '#4a5568' : '#e2e8f0'
                    }}
                    onClick={() => viewRecipe(recipe.id)}
                  >
                    <h3 className="font-medium mb-2" style={{ color: themeColors.text.primary }}>{recipe.title}</h3>
                    <div className="mb-2">
                      <span className="text-sm" style={{ color: themeColors.text.secondary }}>By </span>
                      <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>{recipe.author}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                        Category: <span style={{ color: themeColors.text.primary }}>{recipe.category}</span>
                      </span>
                      <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                        {recipe.date}
                      </span>
                    </div>
                    <div className="flex justify-between mt-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="px-3 py-1 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                        onClick={(e) => approveRecipe(recipe.id, e)}
                      >
                        Approve
                      </button>
                      <button
                        className="px-3 py-1 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                        onClick={(e) => rejectRecipe(recipe.id, e)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RecipeManagement;