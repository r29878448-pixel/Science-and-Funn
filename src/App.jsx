import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ScienceAndFun from './components/ScienceAndFun';
import AdminPanel from './components/AdminPanel';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import ClassSelectionPopup from './components/ClassSelectionPopup';
import TelegramPopup from './components/TelegramPopup';
import { onAuthChange, getUserData, isAdmin } from './services/authService';
import { updateLastActive } from './services/adminService';
import { initDevToolsProtection, setCurrentUser } from './utils/devToolsProtection';

// ============================================
// FULLY API-DRIVEN APPLICATION
// No Firebase for content, only for auth & XP
// All course data from configurable API Base URL
// DevTools Protection Enabled (Admin Whitelisted)
// ============================================

const App = () => {
  const [activeSection, setActiveSection] = useState('scienceandfun');
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showClassPopup, setShowClassPopup] = useState(false);
  const [showTelegramPopup, setShowTelegramPopup] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // Initialize DevTools Protection - INSTANT (no delay)
  useEffect(() => {
    initDevToolsProtection();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    console.log('🔄 Setting up auth listener...');
    
    const unsubscribe = onAuthChange(async (user) => {
      console.log('🔐 Auth state changed:', user ? user.email : 'Not logged in');
      setCurrentUser(user);
      
      // Store user for DevTools protection check
      if (user) {
        setCurrentUser(user);
      }
      
      if (user) {
        console.log('👤 User logged in, fetching data...');
        
        // Update last active time
        await updateLastActive(user.uid);
        
        // Fetch user data from Firestore
        const result = await getUserData(user.uid);
        console.log('📦 getUserData result:', result);
        
        if (result.success) {
          const data = result.data;
          setUserData(data);
          setUserDataLoaded(true);
          console.log('✅ User data loaded:', JSON.stringify(data, null, 2));
          console.log('📊 User class value:', data.class);
          console.log('📊 Class type:', typeof data.class);
          console.log('📊 Class is null?', data.class === null);
          console.log('📊 Class is undefined?', data.class === undefined);
          console.log('📊 Class is falsy?', !data.class);
          console.log('📊 Has class property?', 'class' in data);

          // AGGRESSIVE CHECK: Show popup if class is not properly set
          const hasValidClass = data.class && 
                               data.class !== null && 
                               data.class !== undefined && 
                               data.class !== '' &&
                               ['9th', '10th', '11th', '12th'].includes(data.class);
          
          console.log('📊 Has valid class?', hasValidClass);

          if (!hasValidClass) {
            console.log('⚠️⚠️⚠️ CLASS NOT SELECTED - SHOWING POPUP ⚠️⚠️⚠️');
            console.log('⚠️ Reason: class =', data.class);
            // Delay slightly to ensure UI is ready
            setTimeout(() => {
              console.log('🎯🎯🎯 FORCING showClassPopup to TRUE 🎯🎯🎯');
              setShowClassPopup(true);
              console.log('🎯 showClassPopup state should now be TRUE');
            }, 300);
          } else {
            console.log('✅ Class already selected:', data.class);
            // Class is set, check if we should show Telegram popup
            checkTelegramPopup();
          }
        } else {
          console.error('❌ Failed to load user data:', result.error);
          setUserDataLoaded(true);
        }
      } else {
        console.log('👤 No user logged in');
        setUserData(null);
        setUserDataLoaded(false);
      }
      
      setAuthLoading(false);
      console.log('✅ Auth loading complete');
    });

    return () => {
      console.log('🔄 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Check if Telegram popup should be shown
  const checkTelegramPopup = () => {
    const telegramShown = sessionStorage.getItem('telegramPopupShown');
    console.log('📱📱📱 CHECKING TELEGRAM POPUP 📱📱📱');
    console.log('📱 Telegram popup shown in session:', telegramShown);
    console.log('📱 Should show?', !telegramShown);
    console.log('📱 Current showClassPopup state:', showClassPopup);
    
    if (!telegramShown) {
      console.log('📱📱📱 SHOWING TELEGRAM POPUP IN 1.5 SECONDS 📱📱📱');
      setTimeout(() => {
        console.log('🎯🎯🎯 FORCING showTelegramPopup to TRUE 🎯🎯🎯');
        setShowTelegramPopup(true);
        console.log('🎯 showTelegramPopup state should now be TRUE');
      }, 1500); // Show after 1.5 seconds
    } else {
      console.log('📱 Telegram popup already shown in this session');
    }
  };

  // Update last active every 2 minutes
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        updateLastActive(currentUser.uid);
      }, 120000); // 2 minutes

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Show auth modal if not logged in and trying to access content
  useEffect(() => {
    if (!authLoading && !currentUser && activeSection !== 'admin') {
      setShowAuthModal(true);
    }
  }, [authLoading, currentUser, activeSection]);

  const handleClassSelected = async (selectedClass) => {
    console.log('✅ Class selected:', selectedClass);
    setShowClassPopup(false);
    
    // Reload user data
    if (currentUser) {
      const result = await getUserData(currentUser.uid);
      if (result.success) {
        setUserData(result.data);
        console.log('✅ User data reloaded after class selection');
        
        // Now show Telegram popup
        checkTelegramPopup();
      }
    }
  };

  const handleTelegramPopupClose = () => {
    console.log('📱 Telegram popup closed');
    setShowTelegramPopup(false);
    sessionStorage.setItem('telegramPopupShown', 'true');
  };

  const renderContent = () => {
    // Show loading while checking auth
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Require login for all sections except admin
    if (!currentUser && activeSection !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-8">
              Please sign in to access courses, earn XP, and compete on the leaderboard!
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>
      );
    }

    // Block content access if class not selected
    if (currentUser && userData && !userData.class && activeSection !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-6">🎓</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Class</h2>
            <p className="text-gray-600 mb-8">
              Please select your class to continue and get personalized content.
            </p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'scienceandfun':
        return <ScienceAndFun />;
      case 'leaderboard':
        return <Leaderboard currentUser={currentUser} userData={userData} />;
      case 'profile':
        return <Profile currentUser={currentUser} userData={userData} onUpdate={async () => {
          const result = await getUserData(currentUser.uid);
          if (result.success) setUserData(result.data);
        }} />;
      case 'admin':
        // Check if user is admin
        if (isAdmin(currentUser?.email)) {
          return <AdminDashboard />;
        } else {
          return <AdminPanel onClose={() => setActiveSection('scienceandfun')} />;
        }
      default:
        return <ScienceAndFun />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        currentUser={currentUser}
        userData={userData}
        onAuthClick={() => setShowAuthModal(true)}
      />
      {renderContent()}
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Class Selection Popup (blocks interaction) */}
      {currentUser && userDataLoaded && (
        <>
          {console.log('🔍🔍🔍 CLASS POPUP RENDER CHECK 🔍🔍🔍')}
          {console.log('  showClassPopup:', showClassPopup)}
          {console.log('  currentUser:', currentUser?.email)}
          {console.log('  userDataLoaded:', userDataLoaded)}
          {console.log('  userData:', userData)}
          {console.log('  userData.class:', userData?.class)}
          
          {showClassPopup ? (
            <>
              {console.log('✅✅✅ RENDERING CLASS POPUP ✅✅✅')}
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                backgroundColor: 'rgba(0,0,0,0.5)'
              }}>
                <ClassSelectionPopup 
                  userId={currentUser.uid}
                  onClassSelected={handleClassSelected}
                />
              </div>
            </>
          ) : (
            <>
              {console.log('❌ NOT rendering class popup - showClassPopup is false')}
            </>
          )}
        </>
      )}

      {/* Telegram Popup (engagement) */}
      {!showClassPopup && (
        <>
          {console.log('🔍🔍🔍 TELEGRAM POPUP RENDER CHECK 🔍🔍🔍')}
          {console.log('  showTelegramPopup:', showTelegramPopup)}
          {console.log('  showClassPopup:', showClassPopup)}
          
          {showTelegramPopup ? (
            <>
              {console.log('✅✅✅ RENDERING TELEGRAM POPUP ✅✅✅')}
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99998,
                backgroundColor: 'rgba(0,0,0,0.3)'
              }}>
                <TelegramPopup onClose={handleTelegramPopupClose} />
              </div>
            </>
          ) : (
            <>
              {console.log('❌ NOT rendering telegram popup - showTelegramPopup is false')}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;
