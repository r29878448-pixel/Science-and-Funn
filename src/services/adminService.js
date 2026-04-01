import { collection, getDocs, query, where, orderBy, doc, updateDoc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Get all users with real-time updates
export const subscribeToUsers = (callback) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('totalXP', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const users = [];
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(users);
  });
};

// Get active users (last 5 minutes)
export const getActiveUsers = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('lastActive', '>=', fiveMinutesAgo));
    const snapshot = await getDocs(q);
    
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('❌ Get active users error:', error);
    return { success: false, error: error.message };
  }
};

// Get daily active users
export const getDailyActiveUsers = async () => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('lastActive', '>=', todayStart.toISOString()));
    const snapshot = await getDocs(q);
    
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('❌ Get DAU error:', error);
    return { success: false, error: error.message };
  }
};

// Update user's last active time
export const updateLastActive = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Document doesn't exist, create it with minimal data
      console.log('📝 Creating user document for lastActive tracking');
      const { auth } = await import('../firebase');
      await setDoc(userRef, {
        userId: userId,
        email: auth.currentUser?.email || '',
        name: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User',
        class: null,
        totalXP: 0,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Document exists, just update lastActive
      await updateDoc(userRef, {
        lastActive: new Date().toISOString()
      });
    }
    return { success: true };
  } catch (error) {
    console.error('❌ Update last active error:', error);
    return { success: false, error: error.message };
  }
};

// Get XP history for charts
export const getXPHistory = async (userId = null) => {
  try {
    const historyRef = collection(db, 'xpHistory');
    let q;
    
    if (userId) {
      q = query(historyRef, where('userId', '==', userId), orderBy('timestamp', 'asc'));
    } else {
      q = query(historyRef, orderBy('timestamp', 'asc'));
    }
    
    const snapshot = await getDocs(q);
    const history = [];
    
    snapshot.forEach((doc) => {
      history.push(doc.data());
    });
    
    return { success: true, data: history };
  } catch (error) {
    console.error('❌ Get XP history error:', error);
    return { success: false, error: error.message };
  }
};

// Log XP change for history
export const logXPChange = async (userId, xpAmount, totalXP) => {
  try {
    const historyRef = collection(db, 'xpHistory');
    await setDoc(doc(historyRef), {
      userId,
      xpAmount,
      totalXP,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Log XP change error:', error);
    return { success: false, error: error.message };
  }
};

// Get system settings
export const getSystemSettings = async () => {
  try {
    const settingsRef = doc(db, 'settings', 'system');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return { success: true, data: settingsDoc.data() };
    } else {
      // Default settings
      const defaultSettings = {
        xpSystemEnabled: true,
        leaderboardEnabled: true,
        telegramPopupEnabled: true,
        weeklyXPReset: false,
        lastResetDate: null
      };
      await setDoc(settingsRef, defaultSettings);
      return { success: true, data: defaultSettings };
    }
  } catch (error) {
    console.error('❌ Get settings error:', error);
    return { success: false, error: error.message };
  }
};

// Update system settings
export const updateSystemSettings = async (settings) => {
  try {
    const settingsRef = doc(db, 'settings', 'system');
    await updateDoc(settingsRef, settings);
    return { success: true };
  } catch (error) {
    console.error('❌ Update settings error:', error);
    return { success: false, error: error.message };
  }
};

// Reset all XP
export const resetAllXP = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const promises = [];
    snapshot.forEach((userDoc) => {
      promises.push(updateDoc(doc(db, 'users', userDoc.id), { totalXP: 0 }));
    });
    
    await Promise.all(promises);
    
    // Update last reset date
    await updateSystemSettings({ lastResetDate: new Date().toISOString() });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Reset XP error:', error);
    return { success: false, error: error.message };
  }
};

// Update user XP (admin)
export const updateUserXP = async (userId, newXP) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalXP: newXP,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Update user XP error:', error);
    return { success: false, error: error.message };
  }
};

// Update user name
export const updateUserName = async (userId, name) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('❌ User document does not exist');
      return { success: false, error: 'User document not found' };
    }
    
    await updateDoc(userRef, {
      name,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Update user name error:', error);
    return { success: false, error: error.message };
  }
};

// Get analytics data
export const getAnalytics = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let totalXP = 0;
    let totalUsers = 0;
    const classDistribution = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      totalUsers++;
      totalXP += data.totalXP || 0;
      
      const userClass = data.class || 'Unknown';
      classDistribution[userClass] = (classDistribution[userClass] || 0) + 1;
    });
    
    return {
      success: true,
      data: {
        totalUsers,
        totalXP,
        classDistribution,
        averageXP: totalUsers > 0 ? Math.round(totalXP / totalUsers) : 0
      }
    };
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    return { success: false, error: error.message };
  }
};
