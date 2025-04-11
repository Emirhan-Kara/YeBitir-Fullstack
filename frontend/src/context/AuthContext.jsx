import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getUserProfile } from '../services/ApiService';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  // Initialize auth state from localStorage if available
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState(null);
  
  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        const savedToken = localStorage.getItem('token');
        const savedIsLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (savedToken && savedToken !== 'undefined') {
          setToken(savedToken);
          
          // Fetch fresh user data with the token
          try {
            const userData = await getUserProfile(savedToken);
            setCurrentUser(userData);
            setIsLoggedIn(true);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // Clear potentially invalid token
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            localStorage.setItem('isLoggedIn', 'false');
            setToken(null);
            setCurrentUser(null);
            setIsLoggedIn(false);
          }
        } else if (savedUser && savedUser !== 'undefined' && savedIsLoggedIn === 'true') {
          try {
            const parsedUser = JSON.parse(savedUser);
            setCurrentUser(parsedUser);
            setIsLoggedIn(true);
          } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('currentUser');
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.setItem('isLoggedIn', 'false');
      } finally {
        // Mark as initialized to prevent unnecessary redirects
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      
      // Check if response has the expected structure
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Extract user and token from response
      const { data: { user, token } } = response;
      
      if (!user || !token) {
        throw new Error('Missing user or token in response');
      }
      
      // Set the current user and logged in state
      setCurrentUser(user);
      setToken(token);
      setIsLoggedIn(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('isLoggedIn', 'true');
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'An error occurred during login' };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await apiRegister(name, email, password);
      
      // For registration, we just need to check if it was successful
      // We don't expect token/user data as user needs to login after registration
      if (response.success) {
        return { success: true, message: 'Registration successful! Please log in.' };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'An error occurred during registration' };
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.setItem('isLoggedIn', 'false');
  };

  // Value object to provide through the context
  const value = {
    currentUser,
    isLoggedIn,
    isInitialized,
    token,
    login,
    register,
    logout,
    isAdmin: currentUser?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;