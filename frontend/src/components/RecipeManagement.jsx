import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Check, X, Search, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AdminLayout from './AdminLayout';
import { getRecipeStats, updateRecipeStatus, deleteRecipeAdmin, getAdminRecipes } from '../services/ApiService';

const RecipeManagement = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { dispatch } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0
  });
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAuth = () => {
      if (!token) {
        navigate('/login', { state: { from: '/admin/recipes' } });
        return;
      }

      if (!user) {
        return; // Wait for user data to load
      }

      const role = user.role?.toLowerCase();
      if (role !== 'admin') {
        dispatch({
          type: 'error',
          message: 'Unauthorized access. Admin privileges required.',
          duration: 3000
        });
        navigate('/login');
      }
    };

    checkAuth();
  }, [user, token, navigate, dispatch]);

  // Fetch data function
  const fetchData = async () => {
    if (!token || !user?.role?.toLowerCase() === 'admin') return;

    try {
      const statsData = await getRecipeStats(token);
      setStats(statsData);
      
      const recipesData = await getAdminRecipes(token);
      setRecipes(recipesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message?.includes('401') || error.message?.includes('403')) {
        dispatch({
          type: 'error',
          message: 'Session expired. Please login again.',
          duration: 3000
        });
        navigate('/login');
        return;
      }
      dispatch({
        type: 'error',
        message: 'Failed to load recipe data',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, user, dispatch, navigate]);

  // Handle status change
  const handleStatusChange = async (recipeId, newStatus) => {
    try {
      await updateRecipeStatus(recipeId, newStatus === 'active', token);
      dispatch({
        type: 'success',
        message: `Recipe ${newStatus === 'active' ? 'published' : 'unpublished'} successfully`,
        duration: 3000
      });
      // Refresh data after status change
      fetchData();
    } catch (error) {
      dispatch({
        type: 'error',
        message: 'Failed to update recipe status',
        duration: 3000
      });
    }
  };

  // Filter and search recipes
  const filteredRecipes = Array.isArray(recipes) ? recipes.filter(recipe => {
    const matchesSearch = 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.owner?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.mealType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && recipe.active) || 
      (filterStatus === 'inactive' && !recipe.active);

    return matchesSearch && matchesStatus;
  }) : [];

  // Default theme values in case theme is not properly loaded
  const isDark = theme?.name === 'dark';
  
  const themeColors = {
    primary: isDark ? '#e53e3e' : '#e53e3e',
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

  // Delete recipe
  const handleDeleteRecipe = async (recipeId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipeAdmin(recipeId, token);
        // Remove from local state
        setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
        dispatch({
          type: 'success',
          message: 'Recipe deleted successfully',
          duration: 3000
        });
        // Refresh data to update statistics
        fetchData();
      } catch (error) {
        dispatch({
          type: 'error',
          message: 'Failed to delete recipe',
          duration: 3000
        });
      }
    }
  };

  return (
    <AdminLayout 
      pageTitle="Recipe Management" 
      pageDescription="Manage recipes and recipe submissions"
    >
      {/* Recipe Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="rounded-lg shadow p-4 md:p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Total Recipes</h3>
          <p className="text-2xl md:text-3xl font-bold" style={{ color: themeColors.text.primary }}>{stats.total}</p>
        </div>
        
        <div className="rounded-lg shadow p-4 md:p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Published</h3>
          <p className="text-2xl md:text-3xl font-bold" style={{ color: themeColors.text.primary }}>{stats.published}</p>
        </div>
        
        <div className="rounded-lg shadow p-4 md:p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Unlisted</h3>
          <p className="text-2xl md:text-3xl font-bold" style={{ color: themeColors.text.primary }}>{stats.pending}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5" style={{ color: themeColors.text.secondary }} />
          </div>
          <input
            type="text"
            placeholder="Search recipes by title or author or category"
            className="pl-10 pr-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm md:text-base"
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
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5" style={{ color: themeColors.text.secondary }} />
          </div>
          <select
            className="pl-10 pr-8 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-opacity-50 appearance-none text-sm md:text-base"
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
            <option value="active">Published</option>
            <option value="inactive">Unlisted</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg className="h-4 w-4" style={{ color: themeColors.text.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recipes Table */}
      <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: themeColors.card }}>
        <div className="p-4 md:px-6 border-b" style={{ borderColor: isDark ? '#3a4556' : '#e2e8f0' }}>
          <h2 style={{ color: themeColors.text.primary }} className="font-semibold">Recipes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left" style={{ backgroundColor: themeColors.table.header }}>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Title</th>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider hidden sm:table-cell" style={{ color: themeColors.text.secondary }}>Author</th>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider hidden md:table-cell" style={{ color: themeColors.text.secondary }}>Category</th>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Status</th>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider hidden lg:table-cell" style={{ color: themeColors.text.secondary }}>Date</th>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: isDark ? '#3a4556' : '#e2e8f0' }}>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 md:px-6 py-4 text-center">
                    <div style={{ color: themeColors.text.primary }}>Loading...</div>
                  </td>
                </tr>
              ) : filteredRecipes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 md:px-6 py-4 text-center">
                    <div style={{ color: themeColors.text.primary }}>No recipes found</div>
                  </td>
                </tr>
              ) : (
                filteredRecipes.map(recipe => (
                  <tr 
                    key={recipe.id} 
                    style={{ backgroundColor: themeColors.table.row }}
                    className="hover:bg-opacity-80"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="text-sm font-medium" style={{ color: themeColors.text.primary }}>{recipe.title}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                      <div className="text-sm" style={{ color: themeColors.text.primary }}>{recipe.owner?.username || 'Unknown'}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="text-sm" style={{ color: themeColors.text.primary }}>{recipe.mealType || 'Uncategorized'}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`status-${recipe.id}`}
                            value="active"
                            checked={recipe.active}
                            onChange={() => handleStatusChange(recipe.id, 'active')}
                            className="form-radio h-4 w-4 text-green-600"
                          />
                          <span className="ml-2 text-xs sm:text-sm" style={{ color: themeColors.text.primary }}>Published</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`status-${recipe.id}`}
                            value="inactive"
                            checked={!recipe.active}
                            onChange={() => handleStatusChange(recipe.id, 'inactive')}
                            className="form-radio h-4 w-4 text-yellow-600"
                          />
                          <span className="ml-2 text-xs sm:text-sm" style={{ color: themeColors.text.primary }}>Unlisted</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                      <div className="text-sm" style={{ color: themeColors.text.primary }}>
                        {new Date(recipe.dateCreated).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          className="p-1 rounded hover:bg-opacity-80"
                          style={{ backgroundColor: isDark ? '#3a4556' : '#e2e8f0' }}
                          title="View Recipe"
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                        >
                          <Eye className="h-4 w-4" style={{ color: themeColors.text.primary }} />
                        </button>
                        <button 
                          className="p-1 rounded hover:bg-opacity-80"
                          style={{ backgroundColor: isDark ? '#3a4556' : '#e2e8f0' }}
                          title="Delete Recipe"
                          onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                        >
                          <Trash2 className="h-4 w-4" style={{ color: themeColors.text.primary }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RecipeManagement;