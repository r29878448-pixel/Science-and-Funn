import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  subscribeToUsers, 
  getActiveUsers, 
  getDailyActiveUsers,
  getAnalytics,
  getXPHistory,
  updateUserXP,
  resetAllXP,
  getSystemSettings,
  updateSystemSettings
} from '../services/adminService';
import { getCurrentApiUrl, updateApiUrl } from '../services/apiService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [dauCount, setDauCount] = useState(0);
  const [xpHistory, setXpHistory] = useState([]);
  const [settings, setSettings] = useState(null);
  const [apiUrl, setApiUrlState] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time user updates
    const unsubscribe = subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
    });

    // Refresh active users every minute
    const interval = setInterval(() => {
      loadActiveUsers();
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load analytics
      const analyticsResult = await getAnalytics();
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }

      // Load active users
      await loadActiveUsers();

      // Load DAU
      const dauResult = await getDailyActiveUsers();
      if (dauResult.success) {
        setDauCount(dauResult.count);
      }

      // Load XP history
      const historyResult = await getXPHistory();
      if (historyResult.success) {
        processXPHistory(historyResult.data);
      }

      // Load settings
      const settingsResult = await getSystemSettings();
      if (settingsResult.success) {
        setSettings(settingsResult.data);
      }

      // Load API URL from Firebase
      const currentApiUrl = await getCurrentApiUrl();
      setApiUrlState(currentApiUrl || '');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveUsers = async () => {
    const result = await getActiveUsers();
    if (result.success) {
      setActiveUsersCount(result.count);
    }
  };

  const processXPHistory = (history) => {
    // Group by date for overall XP growth
    const groupedByDate = {};
    history.forEach(entry => {
      const date = entry.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date, totalXP: 0, users: new Set() };
      }
      groupedByDate[date].totalXP += entry.xpAmount;
      groupedByDate[date].users.add(entry.userId);
    });

    const chartData = Object.values(groupedByDate)
      .map(item => ({
        date: item.date,
        xp: item.totalXP,
        activeUsers: item.users.size
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setXpHistory(chartData);
  };

  const handleSaveApiUrl = async () => {
    try {
      await updateApiUrl(apiUrl);
      alert('API URL saved successfully! All users will now use this API.');
    } catch (error) {
      alert('Error saving API URL: ' + error.message);
    }
  };

  const handleResetAllXP = async () => {
    if (!confirm('Are you sure you want to reset ALL user XP to 0? This cannot be undone!')) {
      return;
    }

    const result = await resetAllXP();
    if (result.success) {
      alert('All XP has been reset!');
      loadData();
    } else {
      alert('Error resetting XP: ' + result.error);
    }
  };

  const handleToggleSetting = async (key, value) => {
    const result = await updateSystemSettings({ [key]: value });
    if (result.success) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || user.class === classFilter;
    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8">🔐 Admin Panel</h2>
        
        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'users', icon: '👥', label: 'Users' },
            { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
            { id: 'api', icon: '🔌', label: 'API Settings' },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 font-semibold'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'dashboard' && (
          <DashboardTab 
            analytics={analytics}
            activeUsersCount={activeUsersCount}
            dauCount={dauCount}
            xpHistory={xpHistory}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={filteredUsers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            classFilter={classFilter}
            setClassFilter={setClassFilter}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTab users={users} onResetXP={handleResetAllXP} />
        )}

        {activeTab === 'api' && (
          <APITab 
            apiUrl={apiUrl}
            setApiUrl={setApiUrlState}
            onSave={handleSaveApiUrl}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            settings={settings}
            onToggle={handleToggleSetting}
          />
        )}
      </div>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ analytics, activeUsersCount, dauCount, xpHistory }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Dashboard Overview</h1>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Total Users"
        value={analytics?.totalUsers || 0}
        icon="👥"
        color="blue"
      />
      <StatCard 
        title="Active Users"
        value={activeUsersCount}
        subtitle="Last 5 minutes"
        icon="✅"
        color="green"
      />
      <StatCard 
        title="Daily Active Users"
        value={dauCount}
        subtitle="Today"
        icon="📅"
        color="purple"
      />
      <StatCard 
        title="Total XP"
        value={analytics?.totalXP || 0}
        icon="⭐"
        color="orange"
      />
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* XP Growth Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📈 XP Growth Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={xpHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <Line 
              type="monotone" 
              dataKey="xp" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Active Users Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Daily Active Users</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={xpHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
            />
            <Bar 
              dataKey="activeUsers" 
              fill="#10b981"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/90 text-sm font-medium">{title}</p>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-4xl font-bold mb-1">{value.toLocaleString()}</p>
      {subtitle && <p className="text-white/80 text-xs">{subtitle}</p>}
    </div>
  );
};

export default AdminDashboard;


// Users Tab Component
const UsersTab = ({ users, searchTerm, setSearchTerm, classFilter, setClassFilter }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [newXP, setNewXP] = useState('');

  const handleUpdateXP = async (userId) => {
    const xp = parseInt(newXP);
    if (isNaN(xp) || xp < 0) {
      alert('Please enter a valid XP value');
      return;
    }

    const result = await updateUserXP(userId, xp);
    if (result.success) {
      alert('XP updated successfully!');
      setEditingUser(null);
      setNewXP('');
    } else {
      alert('Error updating XP: ' + result.error);
    }
  };

  const getStatus = (lastActive) => {
    if (!lastActive) return 'Offline';
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastActive) > fiveMinutesAgo ? 'Active' : 'Offline';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">👥 User Management</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            <option value="all">All Classes</option>
            <option value="9th">Class 9</option>
            <option value="10th">Class 10</option>
            <option value="11th">Class 11</option>
            <option value="12th">Class 12</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">XP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.class || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingUser === user.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={newXP}
                          onChange={(e) => setNewXP(e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                          placeholder={user.totalXP}
                        />
                        <button
                          onClick={() => handleUpdateXP(user.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setNewXP('');
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold text-purple-600">{user.totalXP || 0}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getStatus(user.lastActive) === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatus(user.lastActive)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditingUser(user.id);
                        setNewXP(user.totalXP?.toString() || '0');
                      }}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Edit XP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Leaderboard Tab Component
const LeaderboardTab = ({ users, onResetXP }) => {
  const sortedUsers = [...users].sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🏆 Leaderboard Control</h1>
        <button
          onClick={onResetXP}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Reset All XP
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    {index < 3 ? (
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.class || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-2xl font-bold text-purple-600">{user.totalXP || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// API Tab Component
const APITab = ({ apiUrl, setApiUrl, onSave }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">🔌 API Settings</h1>

    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Base API URL</h2>
      <p className="text-gray-600 mb-4">
        Configure the base URL for all API requests. This will be used for fetching courses, videos, and other content.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Base URL
          </label>
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="Enter API Base URL (e.g., https://your-api.com)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        <button
          onClick={onSave}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          Save API URL
        </button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ API Endpoints</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Batches: <code>/batches</code></li>
          <li>• Batch Details: <code>/batchdetails?id=...</code></li>
          <li>• Topics: <code>/topics?id=...</code></li>
          <li>• Video: <code>/video?video_id=...&course_id=...</code></li>
          <li>• Live Classes: <code>/live?course_id=...</code></li>
          <li>• Previous Live: <code>/previous-live?course_id=...</code></li>
        </ul>
      </div>
    </div>
  </div>
);

// Settings Tab Component
const SettingsTab = ({ settings, onToggle }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">⚙️ System Settings</h1>

    <div className="space-y-6">
      <SettingToggle
        title="XP System"
        description="Enable or disable the XP tracking system"
        enabled={settings?.xpSystemEnabled}
        onToggle={(value) => onToggle('xpSystemEnabled', value)}
      />

      <SettingToggle
        title="Leaderboard"
        description="Show or hide the leaderboard from users"
        enabled={settings?.leaderboardEnabled}
        onToggle={(value) => onToggle('leaderboardEnabled', value)}
      />

      <SettingToggle
        title="Telegram Popup"
        description="Enable or disable the Telegram engagement popup"
        enabled={settings?.telegramPopupEnabled}
        onToggle={(value) => onToggle('telegramPopupEnabled', value)}
      />

      <SettingToggle
        title="Weekly XP Reset"
        description="Automatically reset all XP every 7 days"
        enabled={settings?.weeklyXPReset}
        onToggle={(value) => onToggle('weeklyXPReset', value)}
      />
    </div>

    {settings?.lastResetDate && (
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          Last XP Reset: {new Date(settings.lastResetDate).toLocaleString()}
        </p>
      </div>
    )}
  </div>
);

// Setting Toggle Component
const SettingToggle = ({ title, description, enabled, onToggle }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
          enabled ? 'bg-purple-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  </div>
);
