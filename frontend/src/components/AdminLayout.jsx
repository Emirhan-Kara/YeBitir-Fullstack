import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import CollapsibleSidebar from './CollapsibleSidebar';
import { useAuth } from '../context/AuthContext';

// This is a wrapper component for all admin pages
const AdminLayout = ({ children, pageTitle, pageDescription }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, currentUser } = useAuth();
  
  // Default theme values in case theme is not properly loaded
  const isDark = theme?.name === 'dark';

  const navigate = useNavigate();
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const themeColors = {
    primary: isDark ? '#e53e3e' : '#e53e3e', // Keep the same red for both themes
    secondary: isDark ? '#2d3748' : '#4a5568',
    background: isDark ? '#1a202c' : '#f7fafc',
    text: {
      primary: isDark ? '#f7fafc' : '#1a202c',
      secondary: isDark ? '#a0aec0' : '#4a5568'
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: themeColors.background }}>
      <div className="flex flex-1">
        {/* Collapsible Sidebar */}
        <CollapsibleSidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-16 p-8" style={{ backgroundColor: themeColors.background }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>{pageTitle}</h1>
              <p style={{ color: themeColors.text.secondary }}>{pageDescription}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark/Light Mode text with toggle */}
              <div className="flex items-center">
                <span className="mr-2" style={{ color: themeColors.text.primary }}>
                  {isDark ? 'Dark' : 'Light'} Mode
                </span>
                <div 
                  className="relative inline-block w-12 h-6 rounded-full cursor-pointer"
                  onClick={toggleTheme}
                  style={{ 
                    backgroundColor: isDark ? themeColors.secondary : '#e2e8f0'
                  }}
                >
                  <div 
                    className={`
                      absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300
                      ${isDark ? 'translate-x-7' : 'translate-x-0'}
                    `}
                    style={{ top: '2px', left: '2px' }}
                  >
                    {isDark ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-yellow-500 m-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-yellow-500 m-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-md text-white hover:scale-105 cursor-pointer"
                style={{ backgroundColor: themeColors.secondary }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Render the page content */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;