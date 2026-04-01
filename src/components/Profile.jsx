import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getXPHistory } from '../services/adminService';
import { updateUserName } from '../services/adminService';

const Profile = ({ currentUser, userData, onUpdate }) => {
  const [xpHistory, setXpHistory] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(userData?.name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadXPHistory();
    }
  }, [currentUser]);

  const loadXPHistory = async () => {
    try {
      setLoading(true);
      const result = await getXPHistory(currentUser.uid);
      
      if (result.success) {
        // Process data for charts
        const history = result.data;
        
        // Group by date for line chart
        const groupedByDate = {};
        history.forEach(entry => {
          const date = entry.date;
          if (!groupedByDate[date]) {
            groupedByDate[date] = { date, xp: 0 };
          }
          groupedByDate[date].xp = entry.totalXP;
        });
        
        const chartData = Object.values(groupedByDate).sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        setXpHistory(chartData);
        
        // Get last 7 days for weekly chart
        const last7Days = getLast7Days();
        const weeklyChartData = last7Days.map(date => {
          const dayData = history.filter(entry => entry.date === date);
          const xpEarned = dayData.reduce((sum, entry) => sum + entry.xpAmount, 0);
          return {
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            xp: xpEarned
          };
        });
        
        setWeeklyData(weeklyChartData);
      }
    } catch (error) {
      console.error('Error loading XP history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    
    setSaving(true);
    try {
      const result = await updateUserName(currentUser.uid, newName.trim());
      if (result.success) {
        setEditingName(false);
        onUpdate(); // Refresh user data
      }
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
              {userData?.name?.charAt(0).toUpperCase() || userData?.email?.charAt(0).toUpperCase()}
            </div>
            
            {/* Info */}
            <div>
              {editingName ? (
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 rounded-lg text-gray-900 font-semibold"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNewName(userData?.name || '');
                    }}
                    className="bg-white/20 px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold">{userData?.name || 'User'}</h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-white/80 hover:text-white transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-white/90 mb-1">{userData?.email}</p>
              <div className="flex items-center space-x-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  Class {userData?.class}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ {userData?.totalXP || 0} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total XP</p>
              <p className="text-3xl font-bold text-purple-600">{userData?.totalXP || 0}</p>
            </div>
            <div className="text-5xl">⭐</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Class Rank</p>
              <p className="text-3xl font-bold text-blue-600">#-</p>
            </div>
            <div className="text-5xl">🏆</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Overall Rank</p>
              <p className="text-3xl font-bold text-green-600">#-</p>
            </div>
            <div className="text-5xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading charts...</p>
        </div>
      ) : (
        <>
          {/* XP Growth Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Your XP Growth</h2>
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
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly XP Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 This Week's XP</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                />
                <Bar 
                  dataKey="xp" 
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
