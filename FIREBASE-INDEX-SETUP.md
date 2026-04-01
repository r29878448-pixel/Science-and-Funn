# 🔥 Firebase Index Setup Guide

## Problem
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

This error occurs when querying Firestore with multiple fields (class + totalXP).

## Solution: Create Composite Index

### Method 1: Direct Link (Easiest)
Click this link to auto-create the index:
```
https://console.firebase.google.com/v1/r/project/science-and-fun/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9zY2llbmNlLWFuZC1mdW4vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3VzZXJzL2luZGV4ZXMvXxABGgkKBWNsYXNzEAEaCwoHdG90YWxYUBACGgwKCF9fbmFtZV9fEAI
```

### Method 2: Manual Creation

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: `science-and-fun`
3. Go to Firestore Database → Indexes tab
4. Click "Create Index"
5. Configure:
   - Collection ID: `users`
   - Fields to index:
     - Field: `class`, Order: Ascending
     - Field: `totalXP`, Order: Descending
6. Click "Create"

### Index Details
```
Collection: users
Fields:
  - class (Ascending)
  - totalXP (Descending)
```

## Why This Index is Needed

The class-wise leaderboard query:
```javascript
query(
  usersRef, 
  where('class', '==', userClass),
  orderBy('totalXP', 'desc')
)
```

This query filters by `class` AND sorts by `totalXP`, which requires a composite index.

## Index Creation Time
- Usually takes 1-5 minutes
- You'll see "Building..." status
- Once complete, status changes to "Enabled"
- Refresh your app after index is enabled

## Name Update in Leaderboard

### Fixed Issues:
✅ Leaderboard now shows `user.name` instead of email
✅ Falls back to email if name not set
✅ Avatar shows first letter of name
✅ Name updates immediately when changed in Profile

### How It Works:
1. User goes to Profile
2. Clicks edit icon next to name
3. Enters new name
4. Clicks "Save"
5. Name saved to Firebase
6. Parent component refreshes user data
7. Leaderboard automatically updates on next load

### Code Changes:
```javascript
// Before (only showed email)
{user.email?.split('@')[0]}

// After (shows name with fallback)
{user.name || user.email?.split('@')[0]}
```

## Testing Steps

1. **Create Index** (using Method 1 or 2 above)
2. **Wait 1-5 minutes** for index to build
3. **Refresh app** and go to Leaderboard
4. **Click "My Class" tab** - should work now
5. **Go to Profile** and change your name
6. **Go back to Leaderboard** - your new name should appear

## Troubleshooting

### Index Still Building
- Wait a few more minutes
- Check Firebase Console → Indexes tab
- Status should be "Enabled"

### Name Not Updating
- Check browser console for errors
- Verify Firebase rules allow writes to `users` collection
- Try refreshing the page
- Check if `onUpdate()` is being called in Profile component

### Class Tab Still Not Working
- Verify index is "Enabled" in Firebase Console
- Check if user has a valid class set ('9th', '10th', '11th', '12th')
- Clear browser cache and refresh

## Firebase Rules (Optional Check)

Ensure your Firestore rules allow reading/writing user data:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
