import { doc, updateDoc, increment, getDoc, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { logXPChange } from './adminService';

// XP per 3 minutes of watch time
export const XP_PER_INTERVAL = 1;
export const WATCH_INTERVAL_SECONDS = 180; // 3 minutes

// Add XP to user
export const addXP = async (userId, xpAmount = XP_PER_INTERVAL) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Get current XP
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('❌ Cannot add XP: User document does not exist');
      return { success: false, error: 'User document not found' };
    }
    
    const currentXP = userDoc.data().totalXP || 0;
    const newTotalXP = currentXP + xpAmount;
    
    await updateDoc(userRef, {
      totalXP: increment(xpAmount),
      updatedAt: new Date().toISOString()
    });

    // Log XP change for history/charts
    await logXPChange(userId, xpAmount, newTotalXP);

    console.log(`✅ Added ${xpAmount} XP to user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Add XP error:', error);
    return { success: false, error: error.message };
  }
};

// Get user XP
export const getUserXP = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return { success: true, xp: data.totalXP || 0 };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('❌ Get XP error:', error);
    return { success: false, error: error.message };
  }
};

// Get overall leaderboard
export const getOverallLeaderboard = async (limitCount = 100) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('totalXP', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const leaderboard = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push({
        userId: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Fetched overall leaderboard: ${leaderboard.length} users`);
    return { success: true, data: leaderboard };
  } catch (error) {
    console.error('❌ Get leaderboard error:', error);
    return { success: false, error: error.message };
  }
};

// Get class-wise leaderboard
export const getClassLeaderboard = async (userClass, limitCount = 100) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('class', '==', userClass),
      orderBy('totalXP', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    const leaderboard = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push({
        userId: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Fetched class ${userClass} leaderboard: ${leaderboard.length} users`);
    return { success: true, data: leaderboard };
  } catch (error) {
    console.error('❌ Get class leaderboard error:', error);
    return { success: false, error: error.message };
  }
};

// Get user rank in overall leaderboard
export const getUserOverallRank = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const userXP = userData.totalXP || 0;

    // Count users with higher XP
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('totalXP', '>', userXP));
    const querySnapshot = await getDocs(q);

    const rank = querySnapshot.size + 1;

    console.log(`✅ User rank: ${rank}`);
    return { success: true, rank };
  } catch (error) {
    console.error('❌ Get rank error:', error);
    return { success: false, error: error.message };
  }
};

// Get user rank in class leaderboard
export const getUserClassRank = async (userId, userClass) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const userXP = userData.totalXP || 0;

    // Count users in same class with higher XP
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('class', '==', userClass),
      where('totalXP', '>', userXP)
    );
    const querySnapshot = await getDocs(q);

    const rank = querySnapshot.size + 1;

    console.log(`✅ User class rank: ${rank}`);
    return { success: true, rank };
  } catch (error) {
    console.error('❌ Get class rank error:', error);
    return { success: false, error: error.message };
  }
};
