import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import RecipeCard from './RecipeCard';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import { getUserByUsername, getUserRecipes } from '../services/ApiService';
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

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  // Fetch user profile and recipes from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user profile
        const profileData = await getUserByUsername(username);
        setUserProfile(profileData);

        // Fetch user's recipes
        const recipesData = await getUserRecipes(username);
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
        {/* Background with animated food icons - Memoized to prevent re-renders */}
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
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4 md:mb-0 md:mr-6"
            >
              {userProfile.profileImage ? (
                <img 
                  src={`data:image/jpeg;base64,${userProfile.profileImage}`}
                  alt={userProfile.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </motion.div>
            <div className="flex-1 text-center md:text-left">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold mb-1"
                style={{ color: theme.core.text }}
              >
                @{userProfile.username}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ color: theme.core.text, opacity: 0.7 }}
                className="mb-4"
              >
                {userProfile.bio}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                style={{ color: theme.core.text, opacity: 0.7 }}
                className="text-sm mb-4"
              >
                Member since {new Date(userProfile.joinDate).toLocaleDateString()}
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-wrap justify-center md:justify-start items-center gap-6"
              >
                <div className="text-center">
                  <p className="font-semibold" style={{ color: theme.core.text }}>{userProfile.recipesCount}</p>
                  <p className="text-sm" style={{ color: theme.core.text, opacity: 0.7 }}>Recipes</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* User's Recipes Section */}
        <div className="mb-10">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-semibold mb-6 text-center"
            style={{ color: theme.core.text }}
          >
            {userProfile.username}'s Recipes
          </motion.h2>
          
          {userRecipes.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"
            >
              {userRecipes.map(recipe => (
                <motion.div key={recipe.id} variants={itemVariants}>
                  <Link to={`/recipe/${recipe.id}`}>
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
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center p-8 rounded-lg"
              style={{ backgroundColor: theme.core.container }}
            >
              <p className="mb-4">This user hasn't shared any recipes yet.</p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Custom CSS for animations */}
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

export default UserProfilePage;