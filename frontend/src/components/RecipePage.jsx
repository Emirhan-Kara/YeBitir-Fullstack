import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import ImageComponent from './ImageComponent';
import CommentsSection from './CommentsSection';
import SuggestionsSection from './SuggestionsSection';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { deleteRecipe, getRecipeById, saveRecipe, unsaveRecipe, isRecipeSaved } from '../services/ApiService';

// RecipePage component
const RecipePage = (props) => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser, token, isLoggedIn, isInitialized } = useAuth();

  // Check if the current recipe is saved by the user
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isLoggedIn || !token || !recipeId) {
        setIsBookmarked(false);
        return;
      }
      
      try {
        const savedStatus = await isRecipeSaved(recipeId, token);
        setIsBookmarked(savedStatus);
      } catch (error) {
        setIsBookmarked(false);
        console.error("Error checking saved status:", error);
      }
    };
    
    checkSavedStatus();
  }, [recipeId, token, isLoggedIn]);

  useEffect(() => {
    // If props are provided, use them
    if (props.id) {
      setRecipe(props);
      setLoading(false);
      return;
    }
    
    // Otherwise fetch recipe data using recipeId from URL
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeById(recipeId);
        
        if (data.title === "Failed to parse recipe data" || 
            data.title === "Recipe format unexpected" ||
            data.title === "Error fetching recipe") {
          setError(`Failed to load recipe: ${data.description}`);
          setRecipe(null);
        } else {
          // Ensure data has all required properties with fallbacks
          const processedRecipe = {
            id: data.id || recipeId,
            title: data.title || "Untitled Recipe",
            description: data.description || "",
            categories: data.categories || {},
            rating: data.rating || 0,
            servings: data.servings || 1,
            timeInMins: data.timeInMins || 0,
            ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
            instructions: Array.isArray(data.instructions) ? data.instructions : [],
            image: data.image || "",
            headerImage: data.headerImage || data.image || "",
            owner: data.owner || {
              username: "Anonymous",
              profileImage: null,
              joinDate: new Date().toISOString()
            },
            initialComments: [], // Remove this since we'll fetch comments separately
            createdAt: data.createdAt || new Date().toISOString()
          };
          
          setRecipe(processedRecipe);
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(`Failed to load recipe: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId, props, isInitialized]);
  
  
  // Calculate stars based on rating
  const totalStars = 5;
  const rating = recipe?.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3 && rating % 1 < 0.8;
  const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);
  
  if (loading || !isInitialized) {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  if (error || !recipe) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl text-red-500 mb-4">Recipe not found</h2>
        <p className="text-gray-700">{error || "Recipe data is missing"}</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Return to Home
        </Link>
      </div>
    );
  }
  
  // Handle recipe deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      try {
        await deleteRecipe(recipe.id, token);
        navigate('/profile');
      } catch {
        alert('Failed to delete recipe. Please try again.');
      }
    }
  };
  
  // Handle saving/unsaving recipe
  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn || !token) {
      navigate('/login');
      return;
    }
    
    setIsSaving(true);
    try {
      if (isBookmarked) {
        await unsaveRecipe(recipeId, token);
        setIsBookmarked(false);
      } else {
        await saveRecipe(recipeId, token);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error saving/unsaving recipe:", error);
      // Show error message to user
      setError("Failed to save/unsave recipe. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Generate star elements for the rating
  const renderStars = () => {
    const stars = [];
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg 
          key={`full-${i}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-5 h-5"
        >
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg 
          key="half" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          className="w-5 h-5"
        >
          <defs>
            <linearGradient id="halfStarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#halfStarGradient)" 
            stroke="currentColor"
            strokeWidth="1"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
          />
        </svg>
      );
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg 
          key={`empty-${i}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          strokeWidth="1"
          className="w-5 h-5"
        >
          <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
        </svg>
      );
    }
    
    return stars;
  };
  
  // Category button component
  const CategoryButton = ({ label, value }) => {
    return (
      <button 
        onClick={() => navigate(`/search?category=${label.toLowerCase()}&value=${value.toLowerCase()}`)}
        className="px-3 py-2 rounded-full mr-2 mb-2 transition-transform duration-200 hover:scale-105 cursor-pointer hover:brightness-80"
        style={{backgroundColor: theme.core.container, color: theme.text }}
      >
        <span className="font-semibold">{label}:</span> {value}
      </button>
    );
  };
  
  const scrollToComments = () => {
    document.getElementById('comments-section').scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div  className="w-full min-h-screen bg-gray-300"
          style={{ backgroundColor:theme.core.background, color: theme.core.text}}>
      {/* Image */}
      <ImageComponent headerImage={recipe.headerImage}></ImageComponent><br />
      
      {/* Categories */}
      <div className="w-19/20 mx-auto flex flex-wrap justify-center rounded-2xl">
        {Object.entries(recipe.categories || {}).map(([label, value]) => (
          <CategoryButton key={label} label={label} value={value} />
        ))}
      </div><br />
      
      {/* Recipe Title */}
      <div
        className="w-16/20 mx-auto p-6 text-3xl font-bold text-center rounded-full"
        style={{ backgroundColor:theme.core.container, color: theme.text }}>
        {recipe.title}
      </div>
      
      {/* Recipe Stats */}
      <div className="flex flex-wrap justify-center gap-2 py-3 bg-white-100">
        {/* Rating */}
        <div 
          className="px-3 py-2 rounded-full flex items-center gap-1"
          style={{ backgroundColor:theme.core.container, color: theme.text }}>
          <span className="font-bold" >{rating}/{totalStars}</span>
          <div className="flex">
            {renderStars()}
          </div>
        </div>
        
        {/* Servings */}
        <div 
          className="px-3 py-2 rounded-full flex items-center gap-2"
          style={{ backgroundColor:theme.core.container, color: theme.text }}>
          {/* Custom SVG Icon from SVGRepo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 199.603 199.603"
            fill="currentColor"
            className="w-6 h-6 text-white-400"
          >
            <path d="M187.251,173.172c-4.141,0-7.509-3.369-7.509-7.509V32.074c0-1.952,1.569-5.644,7.509-5.644 c9.424,0,12.352,33.462,12.352,45.651c0,18.908-4.182,36.269-4.843,38.893v54.688C194.76,169.803,191.392,173.172,187.251,173.172z M184.742,113.161v52.502c0,1.383,1.125,2.509,2.509,2.509s2.509-1.125,2.509-2.509v-52.502H184.742z M184.742,108.161h5.548 c1.187-5.159,4.313-20.256,4.313-36.079c0-20.876-4.906-38.858-7.546-40.649c-1.542,0.033-2.218,0.461-2.314,0.771V108.161z M16.632,173.172c-1.87,0-3.67-0.734-4.938-2.014c-1.165-1.177-1.799-2.711-1.783-4.318l0.806-81.785 C4.583,82.688,0.142,76.768,0.001,69.852C-0.001,69.79,0,69.727,0.003,69.664L1.718,31.96c0.063-1.378,1.259-2.421,2.61-2.384 c1.38,0.063,2.447,1.232,2.384,2.611l-1.596,35.09h4.361l0.802-35.26c0.031-1.381,1.208-2.48,2.556-2.443 c1.381,0.032,2.474,1.176,2.442,2.556L14.48,67.278h4.306l-0.799-35.147c-0.031-1.38,1.062-2.524,2.442-2.556 c1.358-0.042,2.525,1.062,2.556,2.443l0.802,35.26h4.361l-1.595-35.09c-0.063-1.379,1.004-2.548,2.384-2.611 c1.367-0.052,2.549,1.005,2.61,2.384l1.714,37.703c0.003,0.063,0.004,0.126,0.002,0.188c-0.141,6.915-4.582,12.836-10.716,15.203 l0.807,81.785c0.016,1.607-0.618,3.141-1.783,4.318C20.302,172.438,18.502,173.172,16.632,173.172z M15.706,86.156l-0.795,80.732 c-0.003,0.337,0.181,0.595,0.336,0.751c0.67,0.677,2.099,0.676,2.771,0c0.155-0.157,0.339-0.415,0.336-0.751l-0.796-80.732H15.706z M5.333,72.278c1.256,5.078,5.878,8.878,11.299,8.878c5.422,0,10.044-3.8,11.299-8.878h-6.587c0,0-0.003,0-0.005,0h-9.414 c-0.001,0-0.001,0-0.002,0c0,0-0.001,0-0.002,0H5.333z M102.781,163.258c-36.692,0-66.544-29.852-66.544-66.544 s29.852-66.544,66.544-66.544c36.693,0,66.545,29.852,66.545,66.544S139.475,163.258,102.781,163.258z M102.781,35.169 c-33.936,0-61.544,27.609-61.544,61.544s27.608,61.544,61.544,61.544s61.545-27.609,61.545-61.544S136.717,35.169,102.781,35.169z M102.781,145.155c-26.711,0-48.441-21.731-48.441-48.441s21.73-48.441,48.441-48.441s48.441,21.731,48.441,48.441 S129.492,145.155,102.781,145.155z M102.781,53.272c-23.954,0-43.441,19.488-43.441,43.441s19.487,43.441,43.441,43.441 s43.441-19.488,43.441-43.441S126.735,53.272,102.781,53.272z"></path>
          </svg>

          {/* Servings Text */}
          <span>{recipe.servings || 1} Servings</span>
        </div>

        
        {/* Time */}
        <div 
          className="px-3 py-2 rounded-full flex items-center gap-2"
          style={{ backgroundColor:theme.core.container, color: theme.text }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{recipe.timeInMins || 0} mins</span>
        </div>
        
        {/* Comments */}
        <button 
          onClick={scrollToComments}
          className="hover:brightness-80 px-3 py-2 rounded-full flex items-center gap-2 transition duration-200 cursor-pointer"
          style={{ backgroundColor:theme.core.container, color: theme.text }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Comments</span>
        </button>
        
        {/* Save Button - Only visible for logged in users */}
        {isLoggedIn ? (
          <button
            onClick={handleSaveRecipe}
            disabled={isSaving}
            className={`hover:brightness-80 px-3 py-2 rounded-full flex items-center gap-2 transition duration-200 cursor-pointer ${isSaving ? 'opacity-70' : ''}`}
            style={{ backgroundColor:theme.core.container, color: theme.text }}
            title={isBookmarked ? "Unsave Recipe" : "Save Recipe"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isBookmarked ? 0 : 2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{isSaving ? "Processing..." : (isBookmarked ? "Saved" : "Save")}</span>
          </button>
        ) : (
          <Link to="/login" 
            className="hover:brightness-80 px-3 py-2 rounded-full flex items-center gap-2 transition duration-200 cursor-pointer"
            style={{ backgroundColor:theme.core.container, color: theme.text }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Login to Save</span>
          </Link>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full text-center text-red-500 mt-2">
            {error}
          </div>
        )}
      </div>

      {/* Recipe Actions */}
      <div className="flex justify-center gap-4 mt-2 mb-4">
        {isLoggedIn && currentUser && currentUser.username === recipe.owner.username && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Delete Recipe
          </button>
        )}
      </div>
      <br />
      
      {/* Recipe Content */}
      <div  className="w-19/20 mx-auto rounded-[40px] p-[48px] grid grid-cols-1 md:grid-cols-5 gap-8"
            style={{ backgroundColor:theme.core.container, color: theme.text }}>
        
        {/* Instructions*/}
        <div className="md:col-span-4">
          <h2 className="text-4xl font-bold mb-4">Instructions</h2>
          {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
            recipe.instructions.map((step, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-2xl font-semibold mb-2">Step {index + 1}</h3>
                <div className="w-4/5 border-t border-white mb-2"></div>
                <p>{step}</p>
              </div>
            ))
          ) : (
            <p>No instructions available for this recipe.</p>
          )}
        </div>

        {/* Ingredients and Owner */}
        <div className="md:col-span-1">
          <h2 className="text-3xl font-bold mb-4">Ingredients</h2>
          {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
            <ul className="mb-10 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={`ingredient-${index}`} className="flex items-baseline">
                  <span className="text-yellow-800 mr-2">•</span>
                  {ingredient}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-10">No ingredients listed for this recipe.</p>
          )}

          <h2 className="text-3xl font-bold mb-4">Recipe By</h2>
          <div 
            className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl" 
            style={{ backgroundColor: theme.core.containerHoover }}
          >
            <Link 
              to={isLoggedIn && currentUser && currentUser.username === recipe.owner.username ? '/profile' : `/profile/${recipe.owner.username}`} 
              className="flex flex-col items-center hover:scale-102 transition-transform duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-gray-300 mb-4 flex items-center justify-center overflow-hidden border-4" style={{ borderColor: theme.headerfooter.logoRed }}>
                {recipe.owner.profileImage ? (
                  <img 
                    src={recipe.owner.profileImage}
                    alt={recipe.owner.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNlMmUyZTIiLz48dGV4dCB4PSIyNSIgeT0iMjkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+VTwvdGV4dD48L3N2Zz4="} 
                    alt={recipe.owner.username} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="text-center">
                <p className="font-bold text-2xl mb-1" style={{ color: theme.headerfooter.logoRed }}>
                  {recipe.owner.username}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm opacity-80 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Member since {new Date(recipe.owner.joinDate).toLocaleDateString()}</span>
                </div>
                <button 
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 hover:opacity-90"
                  style={{ 
                    backgroundColor: theme.headerfooter.logoRed,
                    color: theme.core.container
                  }}
                >
                  {isLoggedIn && currentUser && currentUser.username === recipe.owner.username ? 'View Your Profile' : 'View Profile'}
                </button>
              </div>
            </Link>
          </div>
        </div>

      </div><br />

      {/* Suggestions Section*/}
      <SuggestionsSection text='Suggestions'/><br />

      {/* Comments Section */}
      <CommentsSection
        recipeId={recipe.id}
      />
    </div> 
  );
};

export default RecipePage;