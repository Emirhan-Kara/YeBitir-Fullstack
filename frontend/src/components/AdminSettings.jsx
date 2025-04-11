import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import AdminLayout from './AdminLayout';

const AdminSettings = () => {
  const { theme } = useTheme();
  
  // Default theme values in case theme is not properly loaded
  const isDark = theme?.name === 'dark';
  
  const themeColors = {
    primary: isDark ? '#e53e3e' : '#e53e3e', // Keep the same red for both themes
    secondary: isDark ? '#2d3748' : '#4a5568',
    background: isDark ? '#1a202c' : '#f7fafc',
    text: {
      primary: isDark ? '#f7fafc' : '#1a202c',
      secondary: isDark ? '#a0aec0' : '#4a5568'
    },
    card: isDark ? '#2d3748' : 'white',
    input: {
      background: isDark ? '#1a202c' : 'white',
      border: isDark ? '#4a5568' : '#e2e8f0'
    }
  };
  
  // State for password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State for error messages
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    matchError: ''
  });
  
  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  // Handle password update
  const handlePasswordUpdate = () => {
    // Reset previous errors
    setPasswordErrors({
      currentPassword: '',
      matchError: ''
    });
    
    let hasErrors = false;
    
    // Check current password
    if (passwordData.currentPassword !== 'Test1234') {
      setPasswordErrors(prev => ({
        ...prev,
        currentPassword: 'Current password is incorrect'
      }));
      hasErrors = true;
    }
    
    // Check if new passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors(prev => ({
        ...prev,
        matchError: 'New passwords do not match'
      }));
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    // In a real application, this would update the password in the backend
    alert('Password updated successfully!');
    
    // Clear password fields
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <AdminLayout 
      pageTitle="Change Password" 
      pageDescription=""
    >
      <div className="rounded-lg shadow" style={{ backgroundColor: themeColors.card }}>
        <div className="p-6 border-b" style={{ borderColor: isDark ? '#3a4556' : '#e2e8f0' }}>
          <h2 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>Change Password</h2>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Current Admin: admin@gmail.com
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: themeColors.text.primary }}>
                Current Password
              </label>
              <input 
                type="password" 
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={`w-full p-2 rounded-md border ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                style={{ 
                  backgroundColor: themeColors.input.background,
                  borderColor: passwordErrors.currentPassword ? '#e53e3e' : themeColors.input.border,
                  color: themeColors.text.primary
                }}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm mt-1" style={{ color: '#e53e3e' }}>
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: themeColors.text.primary }}>
                New Password
              </label>
              <input 
                type="password" 
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 rounded-md border"
                style={{ 
                  backgroundColor: themeColors.input.background,
                  borderColor: themeColors.input.border,
                  color: themeColors.text.primary
                }}
                placeholder="Minimum 8 characters"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: themeColors.text.primary }}>
                Confirm New Password
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={`w-full p-2 rounded-md border ${passwordErrors.matchError ? 'border-red-500' : ''}`}
                style={{ 
                  backgroundColor: themeColors.input.background,
                  borderColor: passwordErrors.matchError ? '#e53e3e' : themeColors.input.border,
                  color: themeColors.text.primary
                }}
              />
              {passwordErrors.matchError && (
                <p className="text-sm mt-1" style={{ color: '#e53e3e' }}>
                  {passwordErrors.matchError}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end" style={{ 
          borderColor: isDark ? '#3a4556' : '#e2e8f0' 
        }}>
          <button 
            onClick={handlePasswordUpdate}
            className="px-4 py-2 rounded cursor-pointer"
            style={{ 
              backgroundColor: themeColors.primary,
              color: 'white'
            }}
          >
            Update Password
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;