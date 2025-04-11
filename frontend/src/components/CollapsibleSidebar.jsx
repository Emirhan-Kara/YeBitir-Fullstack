import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, Users, BarChart2, Settings, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CollapsibleSidebar = () => {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  
  // Check current path to highlight active link
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Default theme values in case theme is not properly loaded
  const isDark = theme?.name === 'dark';
  
  const themeColors = {
    primary: isDark ? '#e53e3e' : '#e53e3e', // Keep the same red for both themes
    secondary: isDark ? '#2d3748' : '#4a5568',
    background: isDark ? '#1a202c' : '#f7fafc',
    text: {
      primary: isDark ? '#f7fafc' : '#1a202c',
      secondary: isDark ? '#a0aec0' : '#4a5568'
    }
  };

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside 
      className={`fixed left-0 top-0 z-30 h-screen transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
      style={{ 
        backgroundColor: themeColors.secondary,
        transitionProperty: 'width',
      }}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className={`w-full overflow-hidden whitespace-nowrap transition-all duration-300 ${
          collapsed ? "opacity-0 w-0" : "opacity-100 w-full"
        }`}>
          <h2 className="text-2xl font-bold">
            <span className="text-white">Ye</span>
            <span style={{ color: themeColors.primary }}>Bitir</span>
          </h2>
        </div>
      </div>
      <nav className="mt-6">
        <Link 
          to="/admin" 
          className={`flex h-14 items-center transition-all duration-200 ${
            collapsed ? "justify-center px-0" : "px-6"
          } ${isActive('/admin') ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          style={isActive('/admin') ? { backgroundColor: themeColors.primary } : {}}
          title="Dashboard"
        >
          <Home className={`min-w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
            collapsed ? "w-0 opacity-0" : "w-full opacity-100"
          }`}>Dashboard</span>
        </Link>
        <Link 
          to="/admin/recipes" 
          className={`flex h-14 items-center transition-all duration-200 ${
            collapsed ? "justify-center px-0" : "px-6"
          } ${isActive('/admin/recipes') ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          style={isActive('/admin/recipes') ? { backgroundColor: themeColors.primary } : {}}
          title="Recipe Management"
        >
          <UtensilsCrossed className={`min-w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
            collapsed ? "w-0 opacity-0" : "w-full opacity-100"
          }`}>Recipe Management</span>
        </Link>
        <Link 
          to="/admin/comments" 
          className={`flex h-14 items-center transition-all duration-200 ${
            collapsed ? "justify-center px-0" : "px-6"
          } ${isActive('/admin/comments') ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          style={isActive('/admin/comments') ? { backgroundColor: themeColors.primary } : {}}
          title="Comment Management"
        >
          <MessageSquare className={`min-w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
            collapsed ? "w-0 opacity-0" : "w-full opacity-100"
          }`}>Comment Management</span>
        </Link>
        <Link 
          to="/admin/users" 
          className={`flex h-14 items-center transition-all duration-200 ${
            collapsed ? "justify-center px-0" : "px-6"
          } ${isActive('/admin/users') ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          style={isActive('/admin/users') ? { backgroundColor: themeColors.primary } : {}}
          title="User Management"
        >
          <Users className={`min-w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
            collapsed ? "w-0 opacity-0" : "w-full opacity-100"
          }`}>User Management</span>
        </Link>
        <Link 
          to="/admin/settings" 
          className={`flex h-14 items-center transition-all duration-200 ${
            collapsed ? "justify-center px-0" : "px-6"
          } ${isActive('/admin/settings') ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          style={isActive('/admin/settings') ? { backgroundColor: themeColors.primary } : {}}
          title="Settings"
        >
          <Settings className={`min-w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
            collapsed ? "w-0 opacity-0" : "w-full opacity-100"
          }`}>Settings</span>
        </Link>
      </nav>
    </aside>
  );
};

export default CollapsibleSidebar;