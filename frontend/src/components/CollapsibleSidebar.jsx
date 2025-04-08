import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, Users, BarChart2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
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
      className={`transition-all duration-300 ${collapsed ? "w-16" : "w-64"} h-screen fixed left-0 top-0 z-30`} 
      style={{ backgroundColor: themeColors.secondary }}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} p-4`}>
        {!collapsed && (
          <h2 className="text-2xl font-bold">
            <span className="text-white">Ye</span>
            <span style={{ color: themeColors.primary }}>Bitir</span>
          </h2>
        )}
        {/* Toggle button removed since we're using hover */}
      </div>
      <nav className="mt-6">
        <Link 
          to="/admin" 
          className={`flex items-center ${collapsed ? "justify-center" : "px-6"} py-4 ${isActive('/admin') ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          style={isActive('/admin') ? { backgroundColor: themeColors.primary } : {}}
          title="Dashboard"
        >
          <Home className={`w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
          {!collapsed && <span>Dashboard</span>}
        </Link>
        <Link 
          to="/admin/recipes" 
          className={`flex items-center ${collapsed ? "justify-center" : "px-6"} py-4 ${isActive('/admin/recipes') ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          style={isActive('/admin/recipes') ? { backgroundColor: themeColors.primary } : {}}
          title="Recipes Management"
        >
          <UtensilsCrossed className={`w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
          {!collapsed && <span>Recipes Management</span>}
        </Link>
        <Link 
          to="/admin/users" 
          className={`flex items-center ${collapsed ? "justify-center" : "px-6"} py-4 ${isActive('/admin/users') ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          style={isActive('/admin/users') ? { backgroundColor: themeColors.primary } : {}}
          title="User Management"
        >
          <Users className={`w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
          {!collapsed && <span>User Management</span>}
        </Link>
        <Link 
          to="/admin/analytics" 
          className={`flex items-center ${collapsed ? "justify-center" : "px-6"} py-4 ${isActive('/admin/analytics') ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          style={isActive('/admin/analytics') ? { backgroundColor: themeColors.primary } : {}}
          title="Analytics"
        >
          <BarChart2 className={`w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
          {!collapsed && <span>Analytics</span>}
        </Link>
        <Link 
          to="/admin/settings" 
          className={`flex items-center ${collapsed ? "justify-center" : "px-6"} py-4 ${isActive('/admin/settings') ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          style={isActive('/admin/settings') ? { backgroundColor: themeColors.primary } : {}}
          title="Settings"
        >
          <Settings className={`w-5 h-5 ${collapsed ? "" : "mr-3"}`} />
          {!collapsed && <span>Settings</span>}
        </Link>
      </nav>
    </aside>
  );
};

export default CollapsibleSidebar;