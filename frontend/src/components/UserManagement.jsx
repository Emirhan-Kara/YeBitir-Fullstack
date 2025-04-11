import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AdminLayout from './AdminLayout';
import { getAdminUsers, deleteUserAdmin, getUserStats, updateUserStatus, searchUsersAdmin, filterUsersAdmin } from '../services/ApiService';

const UserManagement = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { dispatch } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAuth = () => {
      if (!token) {
        navigate('/login', { state: { from: '/admin/users' } });
        return;
      }

      if (!user) {
        return; // Wait for user data to load
      }

      const role = user.role?.toLowerCase();
      if (role !== 'admin') {
        dispatch({
          type: 'error',
          message: 'Unauthorized access. Admin privileges required.',
          duration: 3000
        });
        navigate('/login');
      }
    };

    checkAuth();
  }, [user, token, navigate, dispatch]);

  // Fetch data function
  const fetchData = async () => {
    if (!token || !user?.role?.toLowerCase() === 'admin') return;

    try {
      // Fetch users
      const usersData = await getAdminUsers(token);
      setUsers(usersData);
      
      // Calculate stats
      setStats({ total: usersData.length });
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message?.includes('401') || error.message?.includes('403')) {
        dispatch({
          type: 'error',
          message: 'Session expired. Please login again.',
          duration: 3000
        });
        navigate('/login');
        return;
      }
      dispatch({
        type: 'error',
        message: 'Failed to load user data',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await deleteUserAdmin(userId, token);
        dispatch({
          type: 'success',
          message: 'User removed successfully',
          duration: 3000
        });
        fetchData(); // Refresh data
      } catch (error) {
        dispatch({
          type: 'error',
          message: 'Failed to remove user',
          duration: 3000
        });
      }
    }
  };

  // Handle user status change
  const handleStatusChange = async (userId, isActive) => {
    try {
      await updateUserStatus(userId, isActive, token);
      dispatch({
        type: 'success',
        message: 'User status updated successfully',
        duration: 3000
      });
      fetchData(); // Refresh data
    } catch (error) {
      dispatch({
        type: 'error',
        message: 'Failed to update user status',
        duration: 3000
      });
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    if (!query.trim()) {
      fetchData(); // Reset to all users if search is empty
      return;
    }

    try {
      const searchResults = await searchUsersAdmin(query, token);
      setUsers(searchResults);
    } catch (error) {
      dispatch({
        type: 'error',
        message: 'Failed to search users',
        duration: 3000
      });
    }
  };

  // Handle filter
  const handleFilter = async (status) => {
    try {
      const filterResults = await filterUsersAdmin({ status }, token);
      setUsers(filterResults);
    } catch (error) {
      dispatch({
        type: 'error',
        message: 'Failed to filter users',
        duration: 3000
      });
    }
  };

  // Update useEffect to handle search changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [token, user]);

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
    table: {
      header: isDark ? '#1e2533' : '#f9fafb',
      row: isDark ? '#2d3748' : 'white',
      hover: isDark ? '#3a4556' : '#f7fafc'
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    return user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <AdminLayout 
      pageTitle="User Management" 
      pageDescription="Manage users and monitor their activities"
    >
      {/* User Stats */}
      <div className="flex justify-center mb-6">
        <div className="rounded-lg shadow p-6 w-64" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium text-center mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-center" style={{ color: themeColors.text.primary }}>{stats.total}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5" style={{ color: themeColors.text.secondary }} />
          </div>
          <input
            type="text"
            placeholder="Search users by username or email..."
            className="pl-10 pr-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm md:text-base"
            style={{ 
              backgroundColor: isDark ? '#3a4556' : 'white',
              color: themeColors.text.primary,
              borderColor: isDark ? '#4a5568' : '#e2e8f0',
              focusRing: themeColors.primary
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg shadow overflow-hidden" style={{ backgroundColor: themeColors.card }}>
        <div className="p-4 md:px-6 border-b" style={{ borderColor: isDark ? '#3a4556' : '#e2e8f0' }}>
          <h2 style={{ color: themeColors.text.primary }} className="font-semibold">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left" style={{ backgroundColor: themeColors.table.header }}>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Username</th>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider hidden sm:table-cell" style={{ color: themeColors.text.secondary }}>Email</th>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider hidden md:table-cell" style={{ color: themeColors.text.secondary }}>Join Date</th>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Role</th>
                <th className="px-4 md:px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: isDark ? '#3a4556' : '#e2e8f0' }}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 md:px-6 py-4 text-center">
                    <div style={{ color: themeColors.text.primary }}>Loading...</div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 md:px-6 py-4 text-center">
                    <div style={{ color: themeColors.text.primary }}>No users found</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr 
                    key={user.id} 
                    style={{ backgroundColor: themeColors.table.row }}
                    className="hover:bg-opacity-80"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="text-sm font-medium" style={{ color: themeColors.text.primary }}>{user.username}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                      <div className="text-sm" style={{ color: themeColors.text.primary }}>{user.email}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="text-sm" style={{ color: themeColors.text.primary }}>
                        {new Date(user.dateCreated).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="text-sm" style={{ color: themeColors.text.primary }}>{user.role}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          className="p-1 rounded hover:bg-opacity-80"
                          style={{ backgroundColor: isDark ? '#3a4556' : '#e2e8f0' }}
                          title="View Profile"
                          onClick={() => navigate(`/profile/${user.username}`)}
                        >
                          <Eye className="h-4 w-4" style={{ color: themeColors.text.primary }} />
                        </button>
                        <button 
                          className="p-1 rounded hover:bg-opacity-80"
                          style={{ backgroundColor: isDark ? '#3a4556' : '#e2e8f0' }}
                          title="Delete User"
                          onClick={(e) => handleDeleteUser(user.id, e)}
                        >
                          <Trash2 className="h-4 w-4" style={{ color: themeColors.text.primary }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;