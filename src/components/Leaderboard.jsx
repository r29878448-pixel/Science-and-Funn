import React, { useState, useEffect } from 'react';
import { getOverallLeaderboard, getClassLeaderboard } from '../services/xpService';

const Leaderboard = ({ currentUser, userData }) => {
  const [activeTab, setActiveTab] = useState('overall');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, userData]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (activeTab === 'overall') {
        result = await getOverallLeaderboard(100);
      } else {
        // Class-wise
        if (!userData?.class) {
          setError('User class not found');
          setLoading(false);
          return;
        }
        result = await getClassLeaderboard(userData.class, 100);
      }

      if (result.success) {
        setLeaderboardData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const isCurrentUser = (userId) => {
    return currentUser?.uid === userId;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
        <p className="text-gray-600">Compete with others and climb the ranks!</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
          <button
            onClick={() => setActiveTab('overall')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              activeTab === 'overall'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Overall
          </button>
          <button
            onClick={() => setActiveTab('class')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              activeTab === 'class'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            My Class {userData?.class && `(${userData.class})`}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
          <p className="font-semibold">Error loading leaderboard</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={loadLeaderboard}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Leaderboard Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4">
            <div className="grid grid-cols-12 gap-4 font-semibold">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-6">User</div>
              <div className="col-span-2 text-center">Class</div>
              <div className="col-span-3 text-right">XP Points</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {leaderboardData.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <p className="text-lg">No users found</p>
                <p className="text-sm mt-2">Be the first to earn XP!</p>
              </div>
            ) : (
              leaderboardData.map((user, index) => {
                const rank = index + 1;
                const medal = getMedalIcon(rank);
                const isCurrent = isCurrentUser(user.userId);

                return (
                  <div
                    key={user.userId}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 transition hover:bg-gray-50 ${
                      isCurrent ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center justify-center">
                      {medal ? (
                        <span className="text-2xl">{medal}</span>
                      ) : (
                        <span className="text-lg font-bold text-gray-700">#{rank}</span>
                      )}
                    </div>

                    {/* User */}
                    <div className="col-span-6 flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {(user.name || user.email)?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.name || user.email?.split('@')[0]}
                          {isCurrent && (
                            <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    {/* Class */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {user.class}
                      </span>
                    </div>

                    {/* XP */}
                    <div className="col-span-3 flex items-center justify-end">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {user.totalXP || 0}
                        </p>
                        <p className="text-xs text-gray-500">XP</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* User Stats Card */}
      {!loading && !error && userData && (
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-1">Your XP</p>
              <p className="text-3xl font-bold">{userData.totalXP || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90 mb-1">Overall Rank</p>
              <p className="text-3xl font-bold">
                #{leaderboardData.findIndex(u => u.userId === currentUser?.uid) + 1 || '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90 mb-1">Class</p>
              <p className="text-3xl font-bold">{userData.class}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
