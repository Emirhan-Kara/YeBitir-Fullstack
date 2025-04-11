import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './AdminLayout';
import { Users, Utensils, MessageSquare, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Default theme values in case theme is not properly loaded
  const isDark = theme?.name === 'dark';
  
  const themeColors = {
    primary: isDark ? '#e53e3e' : '#e53e3e',
    secondary: isDark ? '#2d3748' : '#4a5568',
    background: isDark ? '#1a202c' : '#f7fafc',
    text: {
      primary: isDark ? '#f7fafc' : '#1a202c',
      secondary: isDark ? '#a0aec0' : '#4a5568'
    },
    card: isDark ? '#2d3748' : 'white',
    border: isDark ? '#4a5568' : '#e2e8f0'
  };

  const navigationCards = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: <Users size={24} />,
      path: '/admin/users',
      color: '#3B82F6' // blue
    },
    {
      title: 'Recipe Management',
      description: 'Review and manage recipe submissions',
      icon: <Utensils size={24} />,
      path: '/admin/recipes',
      color: '#10B981' // green
    },
    {
      title: 'Comment Management',
      description: 'Moderate user comments and reports',
      icon: <MessageSquare size={24} />,
      path: '/admin/comments',
      color: '#F59E0B' // yellow
    },
    {
      title: 'Settings',
      description: 'Configure system settings and preferences',
      icon: <Settings size={24} />,
      path: '/admin/settings',
      color: '#6366F1' // indigo
    }
  ];

  return (
    <AdminLayout pageTitle="Admin Dashboard">
      {/* Welcome Section */}
      <div 
        className="p-6 mb-8 rounded-lg shadow-md"
        style={{ backgroundColor: themeColors.card }}
      >
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ color: themeColors.text.primary }}
        >
          Welcome back, {currentUser?.username || 'Admin'}! 👋
        </h1>
        <p 
          className="text-lg"
          style={{ color: themeColors.text.secondary }}
        >
          Manage your website's content and users from this central dashboard.
        </p>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {navigationCards.map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.path)}
            className="p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-102 cursor-pointer"
            style={{ 
              backgroundColor: themeColors.card,
              border: `1px solid ${themeColors.border}`
            }}
          >
            <div className="flex items-start space-x-4">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <div style={{ color: card.color }}>
                  {card.icon}
                </div>
              </div>
              <div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: themeColors.text.primary }}
                >
                  {card.title}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: themeColors.text.secondary }}
                >
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips Section */}
      <div 
        className="mt-8 p-6 rounded-lg shadow-md"
        style={{ backgroundColor: themeColors.card }}
      >
        <h2 
          className="text-xl font-semibold mb-4"
          style={{ color: themeColors.text.primary }}
        >
          Quick Tips
        </h2>
        <ul 
          className="list-disc list-inside space-y-2"
          style={{ color: themeColors.text.secondary }}
        >
          <li>Click on any card above to navigate to that section</li>
          <li>Use the sidebar menu for quick navigation between pages</li>
          <li>Check the comment management section regularly for new reports</li>
          <li>Review recipe submissions in the recipe management section</li>
        </ul>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;