import React, { createContext, useState, useContext, useEffect } from 'react';

// Define theme configurations with new structure
export const themes = {
  light: {
    name: 'light',
    // Recipe Card
    recipecard: {
      background: '#bfd1bc',    // mint-green
      text: '#34495e',          // dark blue
      component: '#34495e',     // dark blue
      componentText: '#e0e0e0', // white
    },
    headerfooter: {
      text: '#34495e',          // dark blue
      logoRed: '#82261b',       // dark-red
      background: '#cfd8dc',    // light gray
      componentBg: '#e0e0e0',   // white
      searchBox: '#bfd1bc',     // mint-green
    },
    core: {
      background: '#e0e0e0',    // white
      container: '#bfd1bc',     // mint-green
      containerHoover: '#a8b8a6', // darker mint-green
      text: '#34495e',          // dark blue
    },
  },
  dark: {
    name: 'dark',
    // Recipe Card
    recipecard: {
      background: '#34495e',    // dark blue
      text: '#e0e0e0',          // white
      component: '#82261b',     // dark red
      componentText: '#e0e0e0', // white
    },
    headerfooter: {
      text: '#e0e0e0',          // white
      logoRed: '#b32c1d',       // light-red
      background: '#202020',    // black
      componentBg: '#34495e',   // dark blue
      searchBox: '#34495e',     // dark blue
    },
    core: {
      background: '#18222c',    // darker dark-blue
      container: '#34495e',     // dark-blue
      containerHoover: '#546679', // lighter dark-blue
      text: '#e0e0e0',          // white
    },
  }
};

// Create the theme context
const ThemeContext = createContext({
  theme: themes.light,
  toggleTheme: () => {}
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Clear any potentially invalid theme data when the app starts
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        // Validate the theme structure
        if (!parsedTheme || !parsedTheme.core || !parsedTheme.core.background) {
          console.warn('Invalid theme structure found in localStorage, resetting to default');
          localStorage.removeItem('theme');
        }
      }
    } catch (error) {
      console.error('Error checking theme in localStorage:', error);
      localStorage.removeItem('theme');
    }
  }, []);

  const [theme, setTheme] = useState(() => {
    // Always start with the known-good default theme
    return themes.light;
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('theme', JSON.stringify(theme));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
    
    // Update CSS variables
    const root = document.documentElement;
    
    // Update recipe card CSS variables
    root.style.setProperty('--color-recipe-card-background', theme.recipecard.background);
    root.style.setProperty('--color-recipe-card-text', theme.recipecard.text);
    root.style.setProperty('--color-recipe-card-component', theme.recipecard.component);
    root.style.setProperty('--color-recipe-card-component-text', theme.recipecard.componentText);
    
    // Update header/footer CSS variables
    root.style.setProperty('--color-header-footer-text', theme.headerfooter.text);
    root.style.setProperty('--color-header-footer-logo-red', theme.headerfooter.logoRed);
    root.style.setProperty('--color-header-footer-background', theme.headerfooter.background);
    root.style.setProperty('--color-header-footer-component-bg', theme.headerfooter.componentBg);
    root.style.setProperty('--color-header-footer-search-box', theme.headerfooter.searchBox);
    
    // Update core CSS variables
    root.style.setProperty('--color-core-background', theme.core.background);
    root.style.setProperty('--color-core-container', theme.core.container);
    root.style.setProperty('--color-core-container-hover', theme.core.containerHoover);
    root.style.setProperty('--color-core-text', theme.core.text);
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => 
      prevTheme.name === 'light' ? themes.dark : themes.light
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
