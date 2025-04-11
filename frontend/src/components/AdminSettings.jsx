import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { updateUserPassword } from '../services/ApiService';
import AdminLayout from './AdminLayout';

const AdminSettings = () => {
  const { theme } = useTheme();
  const { token, user } = useAuth();
  const { dispatch } = useNotification();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validatePassword = (password) => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    if (name === 'newPassword') {
      setPasswordRules(prev => ({
        ...prev,
        ...validatePassword(value)
      }));
    } else if (name === 'confirmPassword') {
      setPasswordRules(prev => ({
        ...prev,
        passwordsMatch: value === formData.newPassword
      }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate current password
    if (!formData.currentPassword) {
      setErrors(prev => ({
        ...prev,
        currentPassword: 'Current password is required'
      }));
      return;
    }

    // Validate new password
    if (!formData.newPassword) {
      setErrors(prev => ({
        ...prev,
        newPassword: 'New password is required'
      }));
      return;
    }

    // Validate password rules
    if (!passwordRules.hasMinLength || 
        !passwordRules.hasUpperCase || 
        !passwordRules.hasLowerCase || 
        !passwordRules.hasNumber || 
        !passwordRules.hasSpecialChar) {
      setErrors(prev => ({
        ...prev,
        newPassword: 'Password does not meet requirements'
      }));
      return;
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Please confirm your new password'
      }));
      return;
    }

    if (!passwordRules.passwordsMatch) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserPassword(token, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      dispatch({
        type: 'success',
        message: 'Password updated successfully',
        duration: 3000
      });
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordRules({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        passwordsMatch: false
      });
      setErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      dispatch({
        type: 'error',
        message: error.message || 'Failed to update password',
        duration: 3000
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const themeColors = {
    primary: theme?.name === 'dark' ? '#e53e3e' : '#e53e3e',
    background: theme?.name === 'dark' ? '#1a202c' : '#f7fafc',
    text: {
      primary: theme?.name === 'dark' ? '#f7fafc' : '#1a202c',
      secondary: theme?.name === 'dark' ? '#a0aec0' : '#4a5568'
    },
    card: theme?.name === 'dark' ? '#2d3748' : 'white',
    input: {
      background: theme?.name === 'dark' ? '#1a202c' : 'white',
      border: theme?.name === 'dark' ? '#4a5568' : '#e2e8f0'
    }
  };

  return (
    <AdminLayout 
      pageTitle="Change Password" 
      pageDescription=""
    >
      <div className="rounded-lg shadow" style={{ backgroundColor: themeColors.card }}>
        <div className="p-6 border-b" style={{ borderColor: theme?.name === 'dark' ? '#3a4556' : '#e2e8f0' }}>
          <h2 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>Change Password</h2>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Current Admin: {user?.email}
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
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-md border ${errors.currentPassword ? 'border-red-500' : ''}`}
                style={{ 
                  backgroundColor: themeColors.input.background,
                  borderColor: errors.currentPassword ? '#e53e3e' : themeColors.input.border,
                  color: themeColors.text.primary
                }}
              />
              {errors.currentPassword && (
                <p className="text-sm mt-1" style={{ color: '#e53e3e' }}>
                  {errors.currentPassword}
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
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-md border ${errors.newPassword ? 'border-red-500' : ''}`}
                style={{ 
                  backgroundColor: themeColors.input.background,
                  borderColor: errors.newPassword ? '#e53e3e' : themeColors.input.border,
                  color: themeColors.text.primary
                }}
                placeholder="Minimum 8 characters"
              />
              {errors.newPassword && (
                <p className="text-sm mt-1" style={{ color: '#e53e3e' }}>
                  {errors.newPassword}
                </p>
              )}
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: themeColors.text.primary }}>
                Confirm New Password
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-md border ${errors.confirmPassword ? 'border-red-500' : ''}`}
                style={{ 
                  backgroundColor: themeColors.input.background,
                  borderColor: errors.confirmPassword ? '#e53e3e' : themeColors.input.border,
                  color: themeColors.text.primary
                }}
              />
              {errors.confirmPassword && (
                <p className="text-sm mt-1" style={{ color: '#e53e3e' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>Password Requirements:</p>
              <ul className="space-y-1">
                <li className={`text-sm ${passwordRules.hasMinLength ? 'text-green-500' : 'text-red-500'}`}>
                  • At least 8 characters long
                </li>
                <li className={`text-sm ${passwordRules.hasUpperCase ? 'text-green-500' : 'text-red-500'}`}>
                  • Contains at least one uppercase letter
                </li>
                <li className={`text-sm ${passwordRules.hasLowerCase ? 'text-green-500' : 'text-red-500'}`}>
                  • Contains at least one lowercase letter
                </li>
                <li className={`text-sm ${passwordRules.hasNumber ? 'text-green-500' : 'text-red-500'}`}>
                  • Contains at least one number
                </li>
                <li className={`text-sm ${passwordRules.hasSpecialChar ? 'text-green-500' : 'text-red-500'}`}>
                  • Contains at least one special character
                </li>
                <li className={`text-sm ${passwordRules.passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                  • Passwords match
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end" style={{ 
          borderColor: theme?.name === 'dark' ? '#3a4556' : '#e2e8f0' 
        }}>
          <button 
            onClick={handlePasswordChange}
            disabled={isUpdating}
            className={`px-4 py-2 rounded cursor-pointer ${
              isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
            }`}
            style={{ 
              backgroundColor: themeColors.primary,
              color: 'white'
            }}
          >
            {isUpdating ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;