import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3kFa1Z6B07RTxL0GDeQo5zUT5e7DAKhY",
  authDomain: "science-and-fun.firebaseapp.com",
  projectId: "science-and-fun",
  storageBucket: "science-and-fun.firebasestorage.app",
  messagingSenderId: "1032926375310",
  appId: "1:1032926375310:web:6c3e5d1ccf8e761d8c48df",
  measurementId: "G-8JRWMMLCZB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side and only if needed
let analytics = null;
if (typeof window !== 'undefined' && typeof window.gtag === 'undefined') {
  // Only initialize analytics if gtag is not already available
  try {
    import('firebase/analytics').then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics initialized');
    }).catch((error) => {
      console.log('⚠️ Firebase Analytics not available:', error.message);
    });
  } catch (error) {
    console.log('⚠️ Firebase Analytics import failed:', error.message);
  }
}

export const db = getFirestore(app);
export const auth = getAuth(app);

// Export analytics if needed (optional)
export { analytics };
