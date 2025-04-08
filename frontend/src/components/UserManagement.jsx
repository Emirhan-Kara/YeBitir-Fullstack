import React, { useState } from 'react';
import { Search, Filter, Eye, Lock, Unlock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AdminLayout from './AdminLayout';

const UserManagement = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Mock data for users
  const [users, setUsers] = useState([
    { 
      id: 1, 
      username: 'AhmetYilmaz', 
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com', 
      joinDate: '2024-12-15', 
      lastActive: '2025-03-06',
      recipeCount: 12,
      commentCount: 45,
      status: 'active'
    },
    { 
      id: 2, 
      username: 'MerveDeniz', 
      name: 'Merve Deniz',
      email: 'merve@example.com', 
      joinDate: '2025-01-05', 
      lastActive: '2025-03-07',
      recipeCount: 8,
      commentCount: 23,
      status: 'active'
    },
    { 
      id: 3, 
      username: 'CanOzturk', 
      name: 'Can Öztürk',
      email: 'can@example.com', 
      joinDate: '2025-01-22', 
      lastActive: '2025-02-28',
      recipeCount: 0,
      commentCount: 17,
      status: 'blocked'
    },
    { 
      id: 4, 
      username: 'ZeynepKaya', 
      name: 'Zeynep Kaya',
      email: 'zeynep@example.com', 
      joinDate: '2024-11-18', 
      lastActive: '2025-03-05',
      recipeCount: 15,
      commentCount: 62,
      status: 'active'
    },
    { 
      id: 5, 
      username: 'EmreAksoy', 
      name: 'Emre Aksoy',
      email: 'emre@example.com', 
      joinDate: '2025-02-10', 
      lastActive: '2025-03-01',
      recipeCount: 3,
      commentCount: 8,
      status: 'active'
    },
    { 
      id: 6, 
      username: 'BurcuDemir', 
      name: 'Burcu Demir',
      email: 'burcu@example.com', 
      joinDate: '2025-01-30', 
      lastActive: '2025-02-15',
      recipeCount: 0,
      commentCount: 31,
      status: 'blocked'
    }
  ]);

  // Mock data for recent user activities
  const userActivities = [
    { id: 1, userId: 1, username: 'AhmetYilmaz', type: 'comment', content: 'This recipe is amazing, thank you!', date: '2025-03-06', target: 'Turkish Baklava Recipe' },
    { id: 2, userId: 4, username: 'ZeynepKaya', type: 'recipe', content: 'Shared a new recipe: Creamy Mushroom Soup', date: '2025-03-05', target: 'Creamy Mushroom Soup' },
    { id: 3, userId: 2, username: 'MerveDeniz', type: 'comment', content: 'I tried this with less sugar and it was still great', date: '2025-03-07', target: 'Classic Rice Pudding' },
    { id: 4, userId: 5, username: 'EmreAksoy', type: 'like', content: 'Liked a recipe', date: '2025-03-01', target: 'Turkish Coffee Technique' },
    { id: 5, userId: 4, username: 'ZeynepKaya', type: 'comment', content: 'Can you suggest an alternative to red pepper?', date: '2025-03-04', target: 'Spicy Chicken Köfte' }
  ];

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
    table: {
      header: isDark ? '#1e2533' : '#f9fafb',
      row: isDark ? '#2d3748' : 'white',
      hover: isDark ? '#3a4556' : '#f7fafc'
    }
  };

  // Filter users based on search and status filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Toggle user blocked status
  const toggleUserStatus = (userId) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' } 
          : user
      )
    );
  };

  return (
    <AdminLayout 
      pageTitle="User Management" 
      pageDescription="Manage users and monitor their activities"
    >
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>1893</p>
        </div>
        
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Active Today</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>642</p>
        </div>
        
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Blocked Users</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>28</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5" style={{ color: themeColors.text.secondary }} />
          </div>
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            className="pl-10 pr-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-opacity-50"
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
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5" style={{ color: themeColors.text.secondary }} />
          </div>
          <select
            className="pl-10 pr-8 py-2 rounded-md w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-opacity-50 appearance-none"
            style={{ 
              backgroundColor: isDark ? '#3a4556' : 'white',
              color: themeColors.text.primary,
              borderColor: isDark ? '#4a5568' : '#e2e8f0',
              focusRing: themeColors.primary
            }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg className="h-4 w-4" style={{ color: themeColors.text.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg shadow mb-8" style={{ 
        backgroundColor: themeColors.card,
      }}>
        <div className="px-6 py-4 border-b" style={{ 
          borderColor: isDark ? '#3a4556' : '#e2e8f0' 
        }}>
          <h2 style={{ color: themeColors.text.primary }} className="font-semibold">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left" style={{ 
                backgroundColor: themeColors.table.header,
              }}>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Name</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Username</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Email</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Join Date</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Last Active</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Recipes</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Comments</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Status</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ 
              borderColor: isDark ? '#3a4556' : '#e2e8f0' 
            }}>
              {filteredUsers.map(user => (
                <tr 
                  key={user.id} 
                  style={{ backgroundColor: themeColors.table.row }}
                  className="hover:bg-opacity-80"
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = themeColors.table.hover}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = themeColors.table.row}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium" style={{ color: themeColors.text.primary }}>{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{user.joinDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{user.lastActive}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{user.recipeCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{user.commentCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' 
                        ? isDark ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'
                        : isDark ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 rounded hover:bg-opacity-80"
                        style={{ backgroundColor: isDark ? '#3a4556' : '#e2e8f0' }}
                        title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.status === 'active' ? (
                          <Lock className="h-4 w-4" style={{ color: themeColors.text.primary }} />
                        ) : (
                          <Unlock className="h-4 w-4" style={{ color: themeColors.text.primary }} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent User Activities */}
      <div className="rounded-lg shadow mb-6" style={{ 
        backgroundColor: themeColors.card,
      }}>
        <div className="px-6 py-4 border-b" style={{ 
          borderColor: isDark ? '#3a4556' : '#e2e8f0' 
        }}>
          <h2 style={{ color: themeColors.text.primary }} className="font-semibold">Recent User Activities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left" style={{ 
                backgroundColor: themeColors.table.header,
              }}>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>User</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Activity</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Target</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Content</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ 
              borderColor: isDark ? '#3a4556' : '#e2e8f0' 
            }}>
              {userActivities.map(activity => (
                <tr 
                  key={activity.id} 
                  style={{ backgroundColor: themeColors.table.row }}
                  className="hover:bg-opacity-80"
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = themeColors.table.hover}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = themeColors.table.row}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium" style={{ color: themeColors.text.primary }}>{activity.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      activity.type === 'comment' 
                        ? isDark ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
                        : activity.type === 'recipe'
                          ? isDark ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'
                          : isDark ? 'bg-purple-900 text-purple-100' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {activity.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{activity.target}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>
                      {activity.content.length > 50 
                        ? `${activity.content.substring(0, 50)}...` 
                        : activity.content
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{activity.date}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;