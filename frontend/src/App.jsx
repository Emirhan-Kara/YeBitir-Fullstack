import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RecipeCard from "./components/RecipeCard"
import RecipePage from "./components/RecipePage"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./components/Home"
import AdminDashboard from "./components/AdminDashboard"
import UserManagement from './components/UserManagement';
import RecipeManagement from './components/RecipeManagement';
import AdminAnalytics from "./components/AdminAnalytics"
import AdminSettings from "./components/AdminSettings"
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ProfilePage from "./components/ProfilePage";
import SearchPage from "./components/SearchPage";
import RecipeWheel from "./components/RecipeWheel";
import AboutUs from "./components/AboutUs";
import AddRecipePage from "./components/AddRecipePage";
import UserProfilePage from "./components/UserProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import KVKKCompliance from "./components/KVKKCompliance";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { NotificationProvider } from './context/NotificationContext';
import RecipeSearchPage from './components/RecipeSearchPage';

// Layout component that conditionally renders Header based on current path
const MainLayout = () => {
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header isHomepage={isHomepage} />
      <main className="flex-grow pt-22">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/recipes" element={<RecipeSearchPage />} />
          <Route path="/recipe/:recipeId" element={<RecipePage />} />
          <Route path="/recipe-wheel" element={<RecipeWheel />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/add-recipe" element={
            <ProtectedRoute>
              <AddRecipePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/:username" element={<UserProfilePage />} />
          <Route path="/kvkk" element={<KVKKCompliance />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/recipes" element={
            <ProtectedRoute adminOnly>
              <RecipeManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute adminOnly>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute adminOnly>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Full-screen Login and SignUp routes without Header/Footer */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* All other routes with standard layout */}
              <Route path="*" element={<MainLayout />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App
