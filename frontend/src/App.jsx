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
import CommentManagement from './components/CommentManagement';
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
import CollapsibleSidebar from './components/CollapsibleSidebar';

// Admin Layout component
const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <CollapsibleSidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/recipes" element={
            <ProtectedRoute adminOnly>
              <RecipeManagement />
            </ProtectedRoute>
          } />
          <Route path="/comments" element={
            <ProtectedRoute adminOnly>
              <CommentManagement />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute adminOnly>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
};

// Main Layout component for regular pages
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
          <Route path="/recipes" element={<SearchPage />} />
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
              
              {/* Admin routes without Header/Footer */}
              <Route path="/admin/*" element={<AdminLayout />} />
              
              {/* All other routes with standard layout */}
              <Route path="*" element={<MainLayout />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
