import React, { useState, useEffect } from 'react';
import { getCurrentApiUrl } from '../services/apiService';
import { signOut } from '../services/authService';

// ============================================
// NAVBAR WITH AUTH & LEADERBOARD
// ============================================

const Navbar = ({ activeSection, setActiveSection, currentUser, userData, onAuthClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    checkApiConfiguration();
  }, []);

  const checkApiConfiguration = () => {
    const apiUrl = getCurrentApiUrl();
    setApiConfigured(!!apiUrl);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      setShowUserMenu(false);
      setActiveSection('scienceandfun');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-blue-600">Science & Fun</h1>
            {!apiConfigured && (
              <p className="text-xs text-red-500">API not configured</p>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setActiveSection('scienceandfun')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeSection === 'scienceandfun'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              📚 Courses
            </button>
            
            {currentUser && (
              <>
                <button
                  onClick={() => setActiveSection('leaderboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeSection === 'leaderboard'
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  🏆 Leaderboard
                </button>

                <button
                  onClick={() => setActiveSection('profile')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeSection === 'profile'
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  👤 Profile
                </button>
              </>
            )}

            {/* User Menu or Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium">{userData?.totalXP || 0} XP</p>
                    <p className="text-xs opacity-90">{userData?.class}</p>
                  </div>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{currentUser.email}</p>
                      <p className="text-xs text-gray-500">Class: {userData?.class}</p>
                      <p className="text-xs text-purple-600 font-bold mt-1">Total XP: {userData?.totalXP || 0}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="px-6 py-2 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-3">
            <div className="px-2 pt-2 space-y-1">
              {currentUser && (
                <div className="px-3 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg mb-2">
                  <p className="text-sm font-semibold">{currentUser.email}</p>
                  <p className="text-xs opacity-90">Class: {userData?.class} | XP: {userData?.totalXP || 0}</p>
                </div>
              )}

              <button
                onClick={() => {
                  setActiveSection('scienceandfun');
                  setMobileMenuOpen(false);
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  activeSection === 'scienceandfun'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                📚 Courses
              </button>
              
              {currentUser && (
                <>
                  <button
                    onClick={() => {
                      setActiveSection('leaderboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                      activeSection === 'leaderboard'
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-700 hover:text-purple-600'
                    }`}
                  >
                    🏆 Leaderboard
                  </button>

                  <button
                    onClick={() => {
                      setActiveSection('profile');
                      setMobileMenuOpen(false);
                    }}
                    className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                      activeSection === 'profile'
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    👤 Profile
                  </button>
                </>
              )}

              {currentUser ? (
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium w-full text-left text-red-600 hover:bg-red-50"
                >
                  🚪 Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAuthClick();
                    setMobileMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium w-full text-left bg-black text-white hover:bg-gray-800"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
