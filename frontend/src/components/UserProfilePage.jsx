import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import RecipeCard from './RecipeCard';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import { getUserProfile, getUserRecipes } from '../services/ApiService';

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
        const profileData = await getUserProfile(username);
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

  // Function to render rating stars
  const renderStars = (rating) => {
    if (rating === "N/A") return "No ratings yet";
    
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.3 && numRating % 1 < 0.8;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" style={{color: theme.headerfooter.logoRed}}>
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <svg 
            key="half"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            className="w-5 h-5"
            style={{color: theme.headerfooter.logoRed}}
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
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-5 h-5" style={{color: theme.headerfooter.logoRed}}>
            <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
          </svg>
        ))}
        
        <span className="ml-2">{rating}</span>
      </div>
    );
  };

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
              <img 
                src={userProfile.profileImage} 
                alt={userProfile.username} 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="flex-1 text-center md:text-left">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold mb-1"
                style={{ color: theme.core.text }}
              >
                {userProfile.name}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-lg mb-2"
                style={{ color: theme.headerfooter.logoRed }}
              >
                @{userProfile.username}
              </motion.p>
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
                Member since {userProfile.joinDate}
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
                <div className="text-center">
                  <div className="flex items-center">
                    <p className="font-semibold mr-2" style={{ color: theme.core.text }}>Avg. Rating:</p>
                    {renderStars(userProfile.avgRating)}
                  </div>
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
        
        {/* Activity Feed Section - Could be expanded in a real app */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: theme.core.container }}
        >
          <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.core.text }}>
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            {/* Sample activity items */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: theme.core.containerHoover }}>
              <p>{userProfile.username} shared a new recipe: <span style={{ color: theme.headerfooter.logoRed }}>Turkish Delight</span></p>
              <p className="text-sm opacity-70">2 days ago</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: theme.core.containerHoover }}>
              <p>{userProfile.username} updated their recipe: <span style={{ color: theme.headerfooter.logoRed }}>Vegetable Börek</span></p>
              <p className="text-sm opacity-70">3 days ago</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: theme.core.containerHoover }}>
              <p>{userProfile.username} shared a new recipe: <span style={{ color: theme.headerfooter.logoRed }}>Turkish Rice Pudding</span></p>
              <p className="text-sm opacity-70">4 days ago</p>
            </div>
          </div>
        </motion.div>
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