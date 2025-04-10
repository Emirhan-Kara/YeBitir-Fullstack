import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import RecipeCard from './RecipeCard';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import { getUserProfile, getUserRecipes } from '../services/ApiService';
import { motion } from 'framer-motion';

// Memoized AnimatedFoodIconsBackground component to prevent re-renders
const AnimatedFoodIconsBackground = React.memo(({ count }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <AnimatedFoodIcons count={count} />
    </div>
  );
});

const UserProfilePage = () => {
  const { username } = useParams();
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile and recipes from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user profile and recipes in parallel
        const [profileData, recipesData] = await Promise.all([
          getUserProfile(username),
          getUserRecipes(username)
        ]);

        console.log('Profile data:', profileData);
        console.log('Recipes data:', recipesData);

        // Check if profile data indicates an error
        if (profileData.bio === "Failed to load user profile" || 
            profileData.bio === "Error loading profile") {
          setError("Failed to load user profile. Please try again later.");
          setLoading(false);
          return;
        }

        setUserProfile(profileData);
        setUserRecipes(recipesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex justify-center items-center"
        style={{ backgroundColor: theme.core.background, color: theme.core.text }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-t-transparent rounded-full" style={{ borderColor: theme.headerfooter.logoRed, borderTopColor: 'transparent' }}></div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex justify-center items-center"
        style={{ backgroundColor: theme.core.background, color: theme.core.text }}
      >
        <div className="text-center p-8 rounded-lg" style={{ backgroundColor: theme.core.container }}>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <Link 
            to="/" 
            className="px-4 py-2 rounded-md"
            style={{ backgroundColor: theme.headerfooter.logoRed, color: '#fff' }}
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div 
        className="min-h-screen flex justify-center items-center"
        style={{ backgroundColor: theme.core.background, color: theme.core.text }}
      >
        <div className="text-center p-8 rounded-lg" style={{ backgroundColor: theme.core.container }}>
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="mb-4">Sorry, we couldn't find a user with the username "{username}".</p>
          <Link 
            to="/" 
            className="px-4 py-2 rounded-md"
            style={{ backgroundColor: theme.headerfooter.logoRed, color: '#fff' }}
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: theme.core.background, color: theme.core.text }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <AnimatedFoodIconsBackground count={40} />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-lg shadow-md p-6 mb-6"
          style={{ backgroundColor: theme.core.container }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Left side - Profile pic and basic info */}
            <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6">
                {userProfile?.profileImage ? (
                  <img
                    src={`data:image/jpeg;base64,${userProfile.profileImage}`}
                    alt={`${username}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2" style={{ color: theme.core.text }}>
                  @{username}
                </h1>
                <p className="text-sm mb-2" style={{ color: theme.core.text, opacity: 0.7 }}>
                  {userProfile?.bio || "No bio yet"}
                </p>
              </div>
            </div>

            {/* Right side - Stats and join date */}
            <div className="flex flex-col items-center md:items-end">
              <div className="flex gap-6 mb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: theme.core.text }}>
                    {userRecipes.length}
                  </p>
                  <p className="text-sm" style={{ color: theme.core.text, opacity: 0.7 }}>
                    Recipes
                  </p>
                </div>
              </div>
              <p className="text-sm" style={{ color: theme.core.text, opacity: 0.7 }}>
                Joined {userProfile?.joinDate ? new Date(userProfile.joinDate).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                }) : 'Recently'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* User's Recipes Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.core.text }}>
            {userProfile.username}'s Recipes
          </h2>
          {userRecipes.length === 0 ? (
            <div className="text-center py-8" style={{ color: theme.core.text, opacity: 0.7 }}>
              <p>No recipes yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRecipes.map((recipe) => (
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
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfilePage;