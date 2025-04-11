import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import RecipePage from './RecipePage';
import SuggestionsSection from './SuggestionsSection';
import RecipeWheel from './RecipeWheel';
import Login from './Login';
import SignUp from './SignUp';
import ProfilePage from './ProfilePage';
import UserProfilePage from './UserProfilePage';
import AboutUs from './AboutUs';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AddRecipePage from './AddRecipePage';
import SearchPage from './SearchPage';
import KVKKCompliance from './KVKKCompliance';
import PrivacyPolicy from './PrivacyPolicy';
import Home from './Home';
import RecipeCard from './RecipeCard';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import RecipeManagement from './RecipeManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';
import ScrollToTop from './ScrollToTop';
import { getAllRecipes, getRecipeById } from '../services/ApiService';

// Improved Private Route component that properly handles redirects
const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoggedIn) {
      // Save the current path for redirect after login
      localStorage.setItem('redirectPath', location.pathname);
      // Redirect to login
      navigate('/login');
    }
  }, [isLoggedIn, location.pathname, navigate]);
  
  // Don't render anything while redirecting
  if (!isLoggedIn) {
    return null;
  }
  
  // Render the protected component if user is logged in
  return children;
};

// Recipe detail component that displays a specific recipe
const RecipeDetail = () => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
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
            comments: Array.isArray(data.comments) ? data.comments : []
          };
          
          setRecipe(processedRecipe);
        }
      } catch (err) {
        setError(`Failed to load recipe: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);
  
  if (loading) {
    return <div className="text-center py-10">Loading recipe...</div>;
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
  
  return (
    <div>
      <RecipePage 
        id={recipe.id}
        title={recipe.title}
        description={recipe.description}
        categories={recipe.categories}
        rating={recipe.rating}
        servings={recipe.servings}
        timeInMins={recipe.timeInMins}
        ingredients={recipe.ingredients}
        instructions={recipe.instructions}
        image={recipe.image}
        headerImage={recipe.headerImage}
        owner={recipe.owner}
        initialComments={recipe.comments}
      />
    </div>
  );
};

// Main HomePage component
const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getAllRecipes();
        setRecipes(data);
      } catch {
        setError('Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading recipes...</div>;
  }

  if (error) {
    return <div className="text-center py-10">Error loading recipes</div>;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <Link key={recipe.id} to={`/recipe/${recipe.id}`}>
              <RecipeCard
                title={recipe.title}
                image={recipe.image}
                timeInMins={recipe.timeInMins}
                rating={recipe.rating}
                servings={recipe.servings}
              />
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Separate component for routes to access hooks
const AppRoutes = () => {
  return (
    <Routes>
      {/* Full-screen Login and SignUp routes without Header/Footer */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/admin" element={
        <ThemeProvider>
          <AdminDashboard />
        </ThemeProvider>
      } />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/recipes" element={<RecipeManagement />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
     
      {/* All other routes with standard layout */}
      <Route path="*" element={<StandardLayout />} />
    </Routes>
  );
};

// Standard layout with Header and Footer
const StandardLayout = () => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.core.background }}>
      {/* Header - isHomepage is true only when on home page */}
      <Routes>
        <Route path="/" element={<Header isHomepage={true} />} />
        <Route path="*" element={<Header isHomepage={false} />} />
      </Routes>
      
      {/* Main content area with padding to account for fixed header */}
      <main className="flex-grow pt-20 pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:recipeId" element={<RecipeDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/recipe-wheel" element={<RecipeWheel />} />
          <Route path="/recipes" element={<SearchPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/add-recipe" element={
            <PrivateRoute>
              <AddRecipePage />
            </PrivateRoute>
          } />
          <Route path="/profile/settings" element={
            <PrivateRoute>
              <ProfilePage initialTab="settings" />
            </PrivateRoute>
          } />
          <Route path="/profile/:username" element={<UserProfilePage />} />
          <Route path="/kvkk" element={<KVKKCompliance />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;