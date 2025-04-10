import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion as Motion } from 'framer-motion';
import RecipeCard from './RecipeCard';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import { 
  getUserProfile, 
  getLoggedInUserRecipes,
  getSavedRecipes,
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount,
  updateProfilePicture,
  addDummyRecipes
} from '../services/ApiService';

// Memoized AnimatedFoodIconsBackground component to prevent re-renders
const AnimatedFoodIconsBackground = React.memo(({ count }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <AnimatedFoodIcons count={count} />
    </div>
  );
});

const ProfilePage = ({ initialTab = 'myRecipes' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userData, setUserData] = useState({
    username: '',
    profileImage: '',
    bio: '',
    recipesCount: 0,
    savedCount: 0,
    email: '',
  });
  const [myRecipes, setMyRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Track original values for comparison
  const [originalValues, setOriginalValues] = useState({
    username: '',
    bio: '',
  });

  // Add these new state variables after the existing state declarations
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    uppercase: false,
    different: false
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Check if profile has changes
  const hasProfileChanges = () => {
    return formData.username !== originalValues.username || formData.bio !== originalValues.bio;
  };

  // Check if password fields have values
  const hasPasswordChanges = () => {
    return formData.currentPassword || formData.newPassword || formData.confirmPassword;
  };

  const { theme } = useTheme();
  const { logout, token, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  // Refs for scroll animations
  const myRecipesRef = useRef(null);
  const savedRecipesRef = useRef(null);
  const settingsRef = useRef(null);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000); // Hide after 5 seconds
  };

  // Fetch user data and recipes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn || !token) {
        navigate('/login');
        return;
      }

      setIsLoading(true);

      try {
        // Fetch user profile
        const profileData = await getUserProfile(token);
        setUserData(profileData);
        
        // Set both form data and original values
        const newFormData = {
          username: profileData.username || '',
          bio: profileData.bio || '',
        };
        setFormData(prev => ({
          ...prev,
          ...newFormData
        }));
        setOriginalValues(newFormData);

        // Fetch user's recipes
        try {
          const recipesData = await getLoggedInUserRecipes(token);
          
          let processedRecipes = [];
          
          // Process recipes data based on various possible formats
          if (Array.isArray(recipesData)) {
            processedRecipes = recipesData;
          } else if (recipesData && typeof recipesData === 'object') {
            if (recipesData.data && Array.isArray(recipesData.data)) {
              processedRecipes = recipesData.data;
            } else if (recipesData.recipes && Array.isArray(recipesData.recipes)) {
              processedRecipes = recipesData.recipes;
            } else {
              // Try to convert object with numeric keys to array
              processedRecipes = Object.keys(recipesData)
                .filter(key => !isNaN(key))
                .map(key => recipesData[key]);
            }
          }
          
          setMyRecipes(processedRecipes);
          setUserData(prev => ({
            ...prev,
            recipesCount: processedRecipes.length
          }));
        } catch (recipeErr) {
          console.error('Error fetching user recipes:', recipeErr);
          showNotification('error', 'Failed to load your recipes. Please try again later.');
          setMyRecipes([]);
        }

        // Fetch saved recipes
        try {
          const savedRecipesData = await getSavedRecipes(token);
          
          let processedSavedRecipes = [];
          
          if (Array.isArray(savedRecipesData)) {
            processedSavedRecipes = savedRecipesData;
          } else if (savedRecipesData && typeof savedRecipesData === 'object') {
            if (savedRecipesData.data && Array.isArray(savedRecipesData.data)) {
              processedSavedRecipes = savedRecipesData.data;
            } else if (savedRecipesData.recipes && Array.isArray(savedRecipesData.recipes)) {
              processedSavedRecipes = savedRecipesData.recipes;
            } else if (savedRecipesData.savedRecipes && Array.isArray(savedRecipesData.savedRecipes)) {
              processedSavedRecipes = savedRecipesData.savedRecipes;
            } else {
              // Try to convert object with numeric keys to array
              processedSavedRecipes = Object.keys(savedRecipesData)
                .filter(key => !isNaN(key))
                .map(key => savedRecipesData[key]);
            }
          }
          
          // Clean up recipe data to ensure all recipes have the necessary properties
          processedSavedRecipes = processedSavedRecipes.map(recipe => ({
            id: recipe.id || recipe.recipeId,
            title: recipe.title || 'Untitled Recipe',
            image: recipe.image || recipe.headerImage || '',
            timeInMins: recipe.timeInMins || 0,
            rating: recipe.rating || 0,
            servings: recipe.servings || 1
          }));
          
          setSavedRecipes(processedSavedRecipes);
          setUserData(prev => ({
            ...prev,
            savedCount: processedSavedRecipes.length
          }));
        } catch (savedErr) {
          console.error('Error fetching saved recipes:', savedErr);
          showNotification('error', 'Failed to load your saved recipes. Please try again later.');
          setSavedRecipes([]);
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.message === 'No authentication token provided' || err.message.includes('403')) {
          logout();
          navigate('/login');
          return;
        }
        showNotification('error', 'Failed to load user data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isLoggedIn, token, navigate, logout]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const updatedProfile = await updateUserProfile(token, {
        username: formData.username,
        bio: formData.bio,
      });

      setUserData(prev => ({
        ...prev,
        username: updatedProfile.username,
        bio: updatedProfile.bio,
      }));
      
      // Update original values after successful update
      setOriginalValues({
        username: updatedProfile.username,
        bio: updatedProfile.bio,
      });
      
      showNotification('success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.message.includes('403')) {
        logout();
        navigate('/login');
        return;
      }
      if (err.message.includes('Username is already taken')) {
        showNotification('error', 'This username is already taken. Please choose another one.');
      } else {
        showNotification('error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Add this new function after the existing functions
  const validatePasswordRequirements = (currentPassword, newPassword) => {
    // Check if new password is different from current password
    const isDifferent = currentPassword !== newPassword;
    
    // Check other requirements
    const hasLength = newPassword.length >= 8;
    const hasNumber = /\d/.test(newPassword);
    const hasUppercase = /[A-Z]/.test(newPassword);
    
    // Update validation state
    setPasswordValidation({
      length: hasLength,
      number: hasNumber,
      uppercase: hasUppercase,
      different: isDifferent
    });
    
    // Return true if all requirements are met
    return hasLength && hasNumber && hasUppercase && isDifferent;
  };
  
  // Add this effect to validate password requirements when password fields change
  useEffect(() => {
    if (formData.newPassword) {
      validatePasswordRequirements(formData.currentPassword, formData.newPassword);
    }
  }, [formData.currentPassword, formData.newPassword]);

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('error', 'New passwords do not match');
      setIsUpdating(false);
      return;
    }
    
    // Check if all password requirements are met
    const allRequirementsMet = validatePasswordRequirements(formData.currentPassword, formData.newPassword);
    if (!allRequirementsMet) {
      showNotification('error', 'Please meet all password requirements');
      setIsUpdating(false);
      return;
    }

    try {
      await updateUserPassword(token, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      showNotification('success', 'Password updated successfully!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      // Reset validation state
      setPasswordValidation({
        length: false,
        number: false,
        uppercase: false,
        different: false
      });
    } catch (err) {
      console.error('Error updating password:', err);
      if (err.message.includes('403') || err.message.includes('permission')) {
        logout();
        navigate('/login');
        return;
      }
      if (err.message.includes('incorrect')) {
        showNotification('error', 'Current password is incorrect');
      } else if (err.message.includes('same as the current password')) {
        showNotification('error', 'New password cannot be the same as the current password');
      } else {
        showNotification('error', err.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsUpdating(true);

    try {
      await deleteUserAccount(token);
      logout();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      if (err.message.includes('403')) {
        logout();
        navigate('/login');
        return;
      }
      showNotification('error', 'Failed to delete account. Please try again.');
      setIsUpdating(false);
    }
  };

  // Scroll animation
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    if (myRecipesRef.current) {
      observer.observe(myRecipesRef.current);
      // Force visibility of initial tab
      if (activeTab === 'myRecipes') {
        myRecipesRef.current.classList.add('animate-fade-in');
        myRecipesRef.current.style.opacity = '1';
      }
    }
    if (savedRecipesRef.current) observer.observe(savedRecipesRef.current);
    if (settingsRef.current) observer.observe(settingsRef.current);

    return () => {
      if (myRecipesRef.current) observer.unobserve(myRecipesRef.current);
      if (savedRecipesRef.current) observer.unobserve(savedRecipesRef.current);
      if (settingsRef.current) observer.unobserve(settingsRef.current);
    };
  }, [activeTab]);

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

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Image size should not exceed 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await updateProfilePicture(file, token);
      if (result.success) {
        setUserData(prev => ({
          ...prev,
          profileImage: result.profileImage
        }));
        showNotification('success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      showNotification('error', error.message || 'Failed to update profile picture. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddSampleRecipes = async () => {
    try {
      await addDummyRecipes();
      alert('Sample recipes added successfully!');
    } catch (error) {
      console.error('Error adding sample recipes:', error);
      alert('Failed to add sample recipes: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.core.background }}>
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2" style={{ borderColor: theme.headerfooter.logoRed }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: theme.core.background, color: theme.core.text }}>
      {/* Notification popup */}
      {notification.message && (
        <div 
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-500 transform translate-y-0 ${
            notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{
            animation: 'slideIn 0.5s ease-out'
          }}
        >
          <p className="text-white font-medium">{notification.message}</p>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        {/* Background with animated food icons - Memoized to prevent re-renders */}
        <AnimatedFoodIconsBackground count={60} />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Profile Header */}
        <Motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-lg shadow-md p-6 mb-6"
          style={{ backgroundColor: theme.core.container }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col md:flex-row items-center">
              <Motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4 md:mb-0 md:mr-6 relative group"
              >
                <div 
                  className="w-full h-full rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handleProfilePictureClick}
                >
                  {userData.profileImage ? (
                    <img
                      src={`data:image/jpeg;base64,${userData.profileImage}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </Motion.div>
              <div className="flex-1 text-center md:text-left">
                <Motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-2xl font-bold mb-2"
                  style={{ color: theme.core.text }}
                >
                  {userData.username}
                </Motion.h1>
                <Motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  style={{ color: theme.core.text, opacity: 0.7 }}
                  className="mb-4"
                >
                  {userData.bio}
                </Motion.p>
                <Motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex flex-wrap justify-center md:justify-start items-center gap-6"
                >
                  <div className="text-center">
                    <p className="font-semibold" style={{ color: theme.core.text }}>{userData.recipesCount}</p>
                    <p className="text-sm" style={{ color: theme.core.text, opacity: 0.7 }}>Recipes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold" style={{ color: theme.core.text }}>{userData.savedCount}</p>
                    <p className="text-sm" style={{ color: theme.core.text, opacity: 0.7 }}>Saved</p>
                  </div>
                </Motion.div>
              </div>
            </div>
            
            {/* Add New Recipe button and Logout button positioned to the right */}
            <Motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4 md:mt-0 flex flex-col gap-3"
            >
              <Link 
                to="/add-recipe" 
                className="px-4 py-2 rounded-md flex items-center transition-all duration-300 hover:shadow-lg no-underline"
                style={{ 
                  backgroundColor: theme.headerfooter.logoRed, 
                  color: '#fff',
                  transform: 'scale(1)',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Recipe
              </Link>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-md flex items-center transition-all duration-300 hover:shadow-lg cursor-pointer hover:scale-105"
                style={{ 
                  backgroundColor: theme.core.containerHoover, 
                  color: theme.core.text,
                  transform: 'scale(1)',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </Motion.div>
          </div>
        </Motion.div>

        {/* Tabs */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-lg shadow-md mb-6 overflow-hidden"
          style={{ backgroundColor: theme.core.container }}
        >
          <div className="flex border-b" style={{ borderColor: `${theme.core.containerHoover}50` }}>
            <button 
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-inner ${activeTab === 'myRecipes' ? 'border-b-2' : ''}`}
              style={{ 
                color: theme.core.text,
                borderColor: activeTab === 'myRecipes' ? theme.headerfooter.logoRed : 'transparent'
              }}
              onClick={() => setActiveTab('myRecipes')}
            >
              My Recipes
            </button>
            <button 
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-inner ${activeTab === 'savedRecipes' ? 'border-b-2' : ''}`}
              style={{ 
                color: theme.core.text,
                borderColor: activeTab === 'savedRecipes' ? theme.headerfooter.logoRed : 'transparent'
              }}
              onClick={() => setActiveTab('savedRecipes')}
            >
              Saved Recipes
            </button>
            <button 
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-inner ${activeTab === 'settings' ? 'border-b-2' : ''}`}
              style={{ 
                color: theme.core.text,
                borderColor: activeTab === 'settings' ? theme.headerfooter.logoRed : 'transparent'
              }}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </Motion.div>

        {/* Content based on active tab */}
        {activeTab === 'myRecipes' && (
          <div ref={myRecipesRef} className="transition-opacity duration-1000 px-6"
               style={{ opacity: isLoading ? 0 : 1 }}>
            <Motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {myRecipes.length > 0 ? (
                myRecipes.map(recipe => (
                  <Motion.div key={recipe.id} variants={itemVariants} className="flex justify-center">
                    <Link to={`/recipe/${recipe.id}`}>
                      <RecipeCard 
                        title={recipe.title}
                        image={recipe.image}
                        timeInMins={recipe.timeInMins}
                        rating={recipe.rating}
                        servings={recipe.servings}
                      />
                    </Link>
                  </Motion.div>
                ))
              ) : (
                <Motion.div 
                  className="col-span-3 text-center py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: theme.core.text }}>
                      You haven't added any recipes yet
                    </h3>
                    <p className="mb-6" style={{ color: theme.core.text, opacity: 0.7 }}>
                      Share your favorite recipes with the community!
                    </p>
                    <Link 
                      to="/add-recipe" 
                      className="px-6 py-3 rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105"
                      style={{ 
                        backgroundColor: theme.headerfooter.logoRed, 
                        color: '#fff'
                      }}
                    >
                      Add Your First Recipe
                    </Link>
                  </div>
                </Motion.div>
              )}
            </Motion.div>
          </div>
        )}

        {activeTab === 'savedRecipes' && (
          <div ref={savedRecipesRef} className="transition-opacity duration-1000 px-6"
               style={{ opacity: isLoading ? 0 : 1 }}>
            <Motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {savedRecipes.length > 0 ? (
                savedRecipes.map(recipe => (
                  <Motion.div key={recipe.id} variants={itemVariants} className="flex justify-center">
                    <Link to={`/recipe/${recipe.id}`}>
                      <RecipeCard 
                        title={recipe.title}
                        image={recipe.image}
                        timeInMins={recipe.timeInMins}
                        rating={recipe.rating}
                        servings={recipe.servings}
                      />
                    </Link>
                  </Motion.div>
                ))
              ) : (
                <Motion.div 
                  className="col-span-3 text-center py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: theme.core.text }}>
                      No saved recipes yet
                    </h3>
                    <p className="mb-6" style={{ color: theme.core.text, opacity: 0.7 }}>
                      Explore recipes and save your favorites for later!
                    </p>
                    <Link 
                      to="/" 
                      className="px-6 py-3 rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105"
                      style={{ 
                        backgroundColor: theme.headerfooter.logoRed, 
                        color: '#fff'
                      }}
                    >
                      Browse Recipes
                    </Link>
                  </div>
                </Motion.div>
              )}
            </Motion.div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div ref={settingsRef} className="opacity-0 transition-opacity duration-1000">
            <div 
              className="rounded-lg shadow-md p-6"
              style={{ backgroundColor: theme.core.container }}
            >
              <Motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-xl font-semibold mb-6"
                style={{ color: theme.core.text }}
              >
                Account Settings
              </Motion.h2>
              
              <div className="space-y-6">
                <Motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="border-b pb-6" 
                  style={{ borderColor: `${theme.core.containerHoover}40` }}
                >
                  <h3 
                    className="text-lg font-medium mb-4"
                    style={{ color: theme.core.text }}
                  >
                    Profile Information
                  </h3>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label 
                        className="block mb-2"
                        style={{ color: theme.core.text }}
                      >
                        Username
                      </label>
                      <input 
                        type="text"
                        name="username"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none"
                        style={{ 
                          backgroundColor: theme.headerfooter.searchBox,
                          borderColor: theme.core.containerHoover,
                          color: theme.core.text
                        }}
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label 
                        className="block mb-2"
                        style={{ color: theme.core.text }}
                      >
                        Bio
                      </label>
                      <textarea 
                        name="bio"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none"
                        style={{ 
                          backgroundColor: theme.headerfooter.searchBox,
                          borderColor: theme.core.containerHoover,
                          color: theme.core.text
                        }}
                        rows="3"
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="flex justify-end mt-8">
                      <button 
                        type="submit"
                        disabled={isUpdating || !hasProfileChanges()}
                        className="px-4 py-2 rounded-md focus:outline-none transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                        style={{ backgroundColor: theme.headerfooter.logoRed, color: '#fff' }}
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </Motion.div>
                
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <h3 
                    className="text-lg font-medium mb-4"
                    style={{ color: theme.core.text }}
                  >
                    Change Password
                  </h3>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label 
                        className="block mb-2"
                        style={{ color: theme.core.text }}
                      >
                        Current Password
                      </label>
                      <input 
                        type="password"
                        name="currentPassword"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none"
                        style={{ 
                          backgroundColor: theme.headerfooter.searchBox,
                          borderColor: theme.core.containerHoover,
                          color: theme.core.text
                        }}
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label 
                        className="block mb-2"
                        style={{ color: theme.core.text }}
                      >
                        New Password
                      </label>
                      <input 
                        type="password"
                        name="newPassword"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none"
                        style={{ 
                          backgroundColor: theme.headerfooter.searchBox,
                          borderColor: theme.core.containerHoover,
                          color: theme.core.text
                        }}
                        value={formData.newPassword}
                        onChange={handleInputChange}
                      />
                      <div className="mt-2 text-sm" style={{ color: theme.core.text }}>
                        <p>Password requirements:</p>
                        <ul className="list-disc pl-5 mt-1">
                          <li style={{ 
                            color: passwordValidation.length ? '#10B981' : '#EF4444',
                            transition: 'color 0.3s ease'
                          }}>
                            At least 8 characters
                            {passwordValidation.length && <span className="ml-1">✓</span>}
                          </li>
                          <li style={{ 
                            color: passwordValidation.number ? '#10B981' : '#EF4444',
                            transition: 'color 0.3s ease'
                          }}>
                            At least one number
                            {passwordValidation.number && <span className="ml-1">✓</span>}
                          </li>
                          <li style={{ 
                            color: passwordValidation.uppercase ? '#10B981' : '#EF4444',
                            transition: 'color 0.3s ease'
                          }}>
                            At least one uppercase letter
                            {passwordValidation.uppercase && <span className="ml-1">✓</span>}
                          </li>
                          <li style={{ 
                            color: passwordValidation.different ? '#10B981' : '#EF4444',
                            transition: 'color 0.3s ease'
                          }}>
                            Cannot be the same as your current password
                            {passwordValidation.different && <span className="ml-1">✓</span>}
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <label 
                        className="block mb-2"
                        style={{ color: theme.core.text }}
                      >
                        Confirm New Password
                      </label>
                      <input 
                        type="password"
                        name="confirmPassword"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none"
                        style={{ 
                          backgroundColor: theme.headerfooter.searchBox,
                          borderColor: theme.core.containerHoover,
                          color: theme.core.text
                        }}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        disabled={isUpdating || !hasPasswordChanges() || 
                                 !passwordValidation.length || 
                                 !passwordValidation.number || 
                                 !passwordValidation.uppercase || 
                                 !passwordValidation.different ||
                                 formData.newPassword !== formData.confirmPassword}
                        className="px-4 py-2 rounded-md focus:outline-none transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                        style={{ backgroundColor: theme.headerfooter.logoRed, color: '#fff' }}
                      >
                        {isUpdating ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </Motion.div>
                
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <h3 
                    className="text-lg font-medium mb-4"
                    style={{ color: theme.core.text }}
                  >
                    Account Actions
                  </h3>
                  <div className="space-y-4">
                    <button 
                      onClick={handleAddSampleRecipes}
                      className="flex items-center transition-all duration-300 hover:translate-x-2 hover:font-medium p-2 rounded-md hover:bg-opacity-10 hover:bg-white"
                      style={{ color: theme.headerfooter.logoRed }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Sample Recipes
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isUpdating}
                      className="flex items-center transition-all duration-300 hover:translate-x-2 hover:font-medium p-2 rounded-md hover:bg-opacity-10 hover:bg-white disabled:opacity-50"
                      style={{ color: theme.headerfooter.logoRed }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Account
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center transition-all duration-300 hover:translate-x-2 hover:font-medium p-2 rounded-md hover:bg-opacity-10 hover:bg-white"
                      style={{ color: theme.headerfooter.logoRed }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </Motion.div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .animate-fade-in {
          animation: fadeIn 1s forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .bg-pattern {
          background-image: radial-gradient(currentColor 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}} />
    </div>
  );
};

export default ProfilePage;