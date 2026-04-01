import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Admin email
export const ADMIN_EMAIL = 'adityaghoghari01@gmail.com';

// Google provider
const googleProvider = new GoogleAuthProvider();

// Sign up with email and class
export const signUp = async (email, password, userClass) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      userId: user.uid,
      email: user.email,
      name: email.split('@')[0], // Default name from email
      class: userClass,
      totalXP: 0,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ User created:', user.email);
    return { success: true, user };
  } catch (error) {
    console.error('❌ Sign up error:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with email
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User signed in:', userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document (without class - will be prompted)
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0], // Use Google display name or email
        class: null, // Will be set via popup
        totalXP: 0,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ New Google user created:', user.email);
    } else {
      console.log('✅ Existing Google user signed in:', user.email);
    }

    return { success: true, user };
  } catch (error) {
    console.error('❌ Google sign in error:', error);
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log('✅ User signed out');
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Get user data from Firestore
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      console.warn('⚠️ User document does not exist, will be created on first update');
      // Return default data structure
      return { 
        success: true, 
        data: {
          userId: userId,
          email: auth.currentUser?.email || '',
          name: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User',
          class: null, // This will trigger class selection popup
          totalXP: 0,
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
  } catch (error) {
    console.error('❌ Get user data error:', error);
    return { success: false, error: error.message };
  }
};

// Update user class
export const updateUserClass = async (userId, userClass) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Document doesn't exist, create it
      console.log('📝 Creating new user document with class:', userClass);
      await setDoc(userRef, {
        userId: userId,
        email: auth.currentUser?.email || '',
        name: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User',
        class: userClass,
        totalXP: 0,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Document exists, update it
      console.log('📝 Updating existing user document with class:', userClass);
      await updateDoc(userRef, {
        class: userClass,
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log('✅ User class updated/created successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Update class error:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is admin
export const isAdmin = (email) => {
  return email === ADMIN_EMAIL;
};

// Auth state observer
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Password reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset error:', error);
    return { success: false, error: error.message };
  }
};
