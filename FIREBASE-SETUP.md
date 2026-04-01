# 🔥 Firebase Setup Guide

## Quick Setup for XP System

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Your project is already configured: `science-and-fun`
3. Enable Authentication and Firestore (already done)

### 2. Enable Email/Password Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Save

### 3. Enable Google Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Enter your project support email
4. Save
5. Add authorized domains (if deploying):
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Add your production domain (e.g., `yourdomain.com`)

### 4. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Production mode** (we'll add rules)
4. Select location (closest to your users)

### 4. Set Firestore Security Rules

Go to **Firestore Database** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read any user (for leaderboard)
      allow read: if request.auth != null;
      
      // Users can create their own document on signup
      allow create: if request.auth != null 
                    && request.auth.uid == userId
                    && request.resource.data.userId == userId
                    && request.resource.data.totalXP == 0;
      
      // Users can only update their own XP
      allow update: if request.auth != null 
                    && request.auth.uid == userId
                    && request.resource.data.userId == userId;
      
      // Admin can do anything
      allow read, write: if request.auth != null 
                         && request.auth.token.email == 'adityaghoghari01@gmail.com';
    }
  }
}
```

### 5. Firestore Indexes (Optional but Recommended)

Go to **Firestore Database** → **Indexes** → **Composite** and create:

1. **Index for Overall Leaderboard**
   - Collection: `users`
   - Fields: `totalXP` (Descending)
   - Query scope: Collection

2. **Index for Class Leaderboard**
   - Collection: `users`
   - Fields: 
     - `class` (Ascending)
     - `totalXP` (Descending)
   - Query scope: Collection

### 6. Test the System

1. **Sign Up**
   ```
   Email: test@example.com
   Password: test123
   Class: 11th
   ```

2. **Watch a Video**
   - Play for 3 minutes
   - Check XP awarded

3. **Check Leaderboard**
   - View overall ranking
   - View class ranking

4. **Admin Access**
   - Visit `/aditya-ghoghari-admin`
   - Sign in with admin email
   - View dashboard

---

## 🔒 Security Best Practices

### 1. Environment Variables (Production)

For production, move Firebase config to environment variables:

```javascript
// .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

```javascript
// src/firebase.js
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

### 2. Rate Limiting

Consider adding rate limiting for:
- Sign up (prevent spam accounts)
- XP updates (prevent abuse)
- Leaderboard queries (prevent excessive reads)

### 3. Email Verification (Optional)

Enable email verification in Firebase Auth settings to ensure valid emails.

---

## 📊 Monitoring

### Firebase Console

Monitor usage in Firebase Console:
- **Authentication** → Active users
- **Firestore** → Document reads/writes
- **Usage** → Quota tracking

### Alerts

Set up alerts for:
- High read/write counts
- Authentication failures
- Quota approaching limits

---

## 🚀 Deployment Checklist

- [ ] Firebase project created
- [ ] Email/Password auth enabled
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] Indexes created
- [ ] Test user created
- [ ] XP tracking tested
- [ ] Leaderboard tested
- [ ] Admin access tested
- [ ] Environment variables set (production)

---

## 🆘 Troubleshooting

### "Permission denied" errors
- Check Firestore security rules
- Ensure user is authenticated
- Verify user ID matches document ID

### XP not updating
- Check browser console for errors
- Verify user is logged in
- Check video is playing (not paused)
- Verify Page Visibility API working

### Leaderboard not loading
- Check Firestore indexes created
- Verify security rules allow read
- Check browser console for errors

### Admin access denied
- Verify email is exactly: `adityaghoghari01@gmail.com`
- Check user is signed in
- Clear browser cache and retry

---

## 📝 Notes

- Firebase free tier includes:
  - 50,000 document reads/day
  - 20,000 document writes/day
  - 1 GB storage
  - 10 GB/month bandwidth

- Monitor usage to avoid unexpected charges
- Consider upgrading to Blaze plan for production
- Set up billing alerts

---

## ✅ Setup Complete!

Your XP tracking system is now ready to use! 🎉
