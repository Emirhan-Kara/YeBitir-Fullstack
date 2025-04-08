import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import AdminLayout from './AdminLayout';
import { Calendar, Filter, Download } from 'lucide-react';

const AdminAnalytics = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState('monthly');
  
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
    chart: {
      colors: ['#e53e3e', '#3182ce', '#38a169', '#d69e2e', '#805ad5']
    }
  };

  // Mock data - Traffic sources
  const trafficData = [
    { name: 'Direct', value: 42 },
    { name: 'Social', value: 28 },
    { name: 'Search', value: 18 },
    { name: 'Referral', value: 12 }
  ];

  // Mock data - User engagement
  const engagementData = [
    { name: 'Jan', views: 4000, likes: 2400, comments: 1200 },
    { name: 'Feb', views: 4200, likes: 2800, comments: 1400 },
    { name: 'Mar', views: 5800, likes: 3200, comments: 1800 },
    { name: 'Apr', views: 4800, likes: 3000, comments: 1600 },
    { name: 'May', views: 6000, likes: 3600, comments: 2000 },
    { name: 'Jun', views: 7200, likes: 4200, comments: 2400 },
    { name: 'Jul', views: 8400, likes: 4800, comments: 2800 },
    { name: 'Aug', views: 7800, likes: 4600, comments: 2600 },
    { name: 'Sep', views: 8800, likes: 5000, comments: 3000 },
    { name: 'Oct', views: 9200, likes: 5400, comments: 3200 },
    { name: 'Nov', views: 9800, likes: 5600, comments: 3400 },
    { name: 'Dec', views: 10200, likes: 6000, comments: 3600 }
  ];

  // Mock data - User retention
  const retentionData = [
    { month: 'Jan', retention: 88 },
    { month: 'Feb', retention: 85 },
    { month: 'Mar', retention: 86 },
    { month: 'Apr', retention: 87 },
    { month: 'May', retention: 88 },
    { month: 'Jun', retention: 90 },
    { month: 'Jul', retention: 92 },
    { month: 'Aug', retention: 91 },
    { month: 'Sep', retention: 93 },
    { month: 'Oct', retention: 94 },
    { month: 'Nov', retention: 92 },
    { month: 'Dec', retention: 93 }
  ];

  // Mock data - Top recipes
  const topRecipes = [
    { id: 1, title: 'Homemade Turkish Lahmacun', author: 'Emirhan', category: 'Main Course', views: 4235, likes: 842 },
    { id: 2, title: 'Authentic Adana Kebab', author: 'Hayrunnisa', category: 'Main Course', views: 3756, likes: 729 },
    { id: 3, title: 'Classic Turkish Baklava', author: 'Rumeysa', category: 'Desserts', views: 3542, likes: 684 },
    { id: 4, title: 'Quick Breakfast Menemen', author: 'CookingMaster', category: 'Breakfast', views: 3129, likes: 575 },
    { id: 5, title: 'Spicy Chicken Köfte', author: 'Zaid', category: 'Main Course', views: 2987, likes: 523 }
  ];

  // Mock data - Device usage
  const deviceData = [
    { name: 'Mobile', users: 62 },
    { name: 'Desktop', users: 28 },
    { name: 'Tablet', users: 10 }
  ];

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };
  
  // Handle export report functionality
  const handleExportReport = () => {
    // Create a simple CSV with analytics data
    const headers = ['Metric', 'Value', 'Change'];
    const rows = [
      ['Total Page Views', '65,428', '+18.2%'],
      ['Avg. Session Duration', '4:32', '+5.7%'],
      ['Bounce Rate', '32.8%', '-3.4%'],
      ['Conversion Rate', '7.6%', '+1.2%']
    ];
    
    // Format as CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Ye-Bitir-Analytics-${timeRange}-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={themeColors.text.primary} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${trafficData[index].name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <AdminLayout 
      pageTitle="Analytics" 
      pageDescription=""
    >
      {/* Filters & Controls */}
      <div className="mb-8 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="flex items-center" style={{ 
            backgroundColor: themeColors.card,
            color: themeColors.text.primary,
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <Calendar className="w-4 h-4 mr-2" style={{ color: themeColors.primary }} />
            <select 
              value={timeRange} 
              onChange={handleTimeRangeChange}
              className="bg-transparent outline-none"
              style={{ color: themeColors.text.primary }}
            >
              <option value="daily" style={{ color: isDark ? 'white' : 'black', backgroundColor: isDark ? '#2d3748' : 'white' }}>Daily</option>
              <option value="weekly" style={{ color: isDark ? 'white' : 'black', backgroundColor: isDark ? '#2d3748' : 'white' }}>Weekly</option>
              <option value="monthly" style={{ color: isDark ? 'white' : 'black', backgroundColor: isDark ? '#2d3748' : 'white' }}>Monthly</option>
              <option value="yearly" style={{ color: isDark ? 'white' : 'black', backgroundColor: isDark ? '#2d3748' : 'white' }}>Yearly</option>
            </select>
          </div>
          
          {/* Filter button removed as requested */}
        </div>
        
        <button 
          onClick={handleExportReport}
          className="flex items-center cursor-pointer" 
          style={{ 
            backgroundColor: themeColors.primary,
            color: 'white',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Stats Cards - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Total Page Views</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>65,428</p>
          <p className="text-sm mt-2" style={{ color: '#38a169' }}>↑ 18.2% from last month</p>
        </div>
        
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Avg. Session Duration</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>4:32</p>
          <p className="text-sm mt-2" style={{ color: '#38a169' }}>↑ 5.7% from last month</p>
        </div>
        
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Bounce Rate</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>32.8%</p>
          <p className="text-sm mt-2" style={{ color: themeColors.primary }}>↓ 3.4% from last month</p>
        </div>
        
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.secondary }} className="text-sm font-medium mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>7.6%</p>
          <p className="text-sm mt-2" style={{ color: '#38a169' }}>↑ 1.2% from last month</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Engagement Chart */}
        <div className="lg:col-span-2 rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.primary }} className="font-medium mb-4">User Engagement</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={engagementData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ddd'} />
                <XAxis dataKey="name" stroke={isDark ? '#ccc' : '#666'} />
                <YAxis stroke={isDark ? '#ccc' : '#666'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#3a4556' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    border: `1px solid ${isDark ? '#555' : '#ddd'}`
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke={themeColors.chart.colors[0]}
                  strokeWidth={2}
                  dot={{ fill: themeColors.chart.colors[0] }}
                  activeDot={{ r: 8, fill: themeColors.chart.colors[0] }}
                />
                <Line 
                  type="monotone" 
                  dataKey="likes" 
                  stroke={themeColors.chart.colors[1]}
                  strokeWidth={2}
                  dot={{ fill: themeColors.chart.colors[1] }}
                  activeDot={{ r: 8, fill: themeColors.chart.colors[1] }}
                />
                <Line 
                  type="monotone" 
                  dataKey="comments" 
                  stroke={themeColors.chart.colors[2]}
                  strokeWidth={2}
                  dot={{ fill: themeColors.chart.colors[2] }}
                  activeDot={{ r: 8, fill: themeColors.chart.colors[2] }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources Chart */}
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.primary }} className="font-medium mb-4">Traffic Sources</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={themeColors.chart.colors[index % themeColors.chart.colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#3a4556' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    border: `1px solid ${isDark ? '#555' : '#ddd'}`
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Retention Chart */}
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.primary }} className="font-medium mb-4">User Retention Rate</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={retentionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ddd'} />
                <XAxis dataKey="month" stroke={isDark ? '#ccc' : '#666'} />
                <YAxis stroke={isDark ? '#ccc' : '#666'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#3a4556' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    border: `1px solid ${isDark ? '#555' : '#ddd'}`
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="retention" 
                  stroke={themeColors.chart.colors[0]} 
                  fill={themeColors.chart.colors[0]} 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Usage Chart */}
        <div className="rounded-lg shadow p-6" style={{ 
          backgroundColor: themeColors.card,
        }}>
          <h3 style={{ color: themeColors.text.primary }} className="font-medium mb-4">Device Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deviceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ddd'} />
                <XAxis dataKey="name" stroke={isDark ? '#ccc' : '#666'} />
                <YAxis stroke={isDark ? '#ccc' : '#666'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#3a4556' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    border: `1px solid ${isDark ? '#555' : '#ddd'}`
                  }}
                />
                <Bar dataKey="users" fill={themeColors.chart.colors[1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Recipes Table */}
      <div className="rounded-lg shadow mb-6" style={{ 
        backgroundColor: themeColors.card,
      }}>
        <div className="px-6 py-4 border-b flex justify-between items-center" style={{ 
          borderColor: isDark ? '#3a4556' : '#e2e8f0' 
        }}>
          <h2 style={{ color: themeColors.text.primary }} className="font-semibold">Top Performing Recipes</h2>
          <a 
            href="/admin/recipes" 
            className="text-sm hover:underline"
            style={{ color: themeColors.primary }}
          >
            View All Recipes
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left" style={{ 
                backgroundColor: themeColors.table?.header || (isDark ? '#1e2533' : '#f9fafb'),
              }}>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Title</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Author</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Category</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Views</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Likes</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ 
              borderColor: isDark ? '#3a4556' : '#e2e8f0' 
            }}>
              {topRecipes.map(recipe => (
                <tr 
                  key={recipe.id} 
                  style={{ backgroundColor: themeColors.table?.row || (isDark ? '#2d3748' : 'white') }}
                  className="hover:bg-opacity-80"
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = themeColors.table?.hover || (isDark ? '#3a4556' : '#f7fafc')}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = themeColors.table?.row || (isDark ? '#2d3748' : 'white')}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium" style={{ color: themeColors.text.primary }}>{recipe.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{recipe.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm" style={{ color: themeColors.text.primary }}>{recipe.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text.primary }}>{recipe.views.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text.primary }}>{recipe.likes.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${(recipe.likes / recipe.views * 100).toFixed(1)}%`,
                          backgroundColor: themeColors.primary 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs block mt-1" style={{ color: themeColors.text.secondary }}>
                      {(recipe.likes / recipe.views * 100).toFixed(1)}%
                    </span>
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

export default AdminAnalytics;