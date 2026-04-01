# 🔧 API Configuration Guide

## Overview
Science and Fun is a **100% API-driven application**. All content is fetched from a configurable API Base URL that is set by the admin and **automatically available to all users**.

## ✅ How It Works

### 1. Configuration Location
**Admin Dashboard → API Settings**
- Route: `/aditya-ghoghari-admin`
- Only accessible by: `adityaghoghari01@gmail.com`

### 2. Storage
- API Base URL is stored in **Firebase Firestore**
- Collection: `settings`
- Document: `apiConfig`
- **Available to ALL users automatically**
- No per-user configuration needed

### 3. Usage Flow
```
Admin Panel
    ↓
Set API Base URL
    ↓
Saved to Firebase (Global)
    ↓
All users load from Firebase
    ↓
apiService.js uses this URL
    ↓
Content displayed for everyone
```

## 🎯 Science and Fun Architecture

### Main Component: `ScienceAndFun.jsx`
Uses: `src/services/apiService.js`

### API Service: `apiService.js`
- Loads API Base URL from localStorage
- All API endpoints use this base URL
- Security validation on every request
- Caching for better performance
- Generic error messages (no technical details exposed)

### Supported Endpoints
```javascript
GET ${BASE_URL}/batches
GET ${BASE_URL}/content?course_id={id}
GET ${BASE_URL}/content?course_id={id}&parent_id={folderId}
GET ${BASE_URL}/video-details?video_id={id}&course_id={id}
GET ${BASE_URL}/live?course_id={id}
GET ${BASE_URL}/previous-live?course_id={id}
GET ${BASE_URL}/attachment?id={id}&course_id={id}
```

## 🚫 NO Hardcoded URLs

### ✅ Correct (Used in Science and Fun)
```javascript
// src/services/apiService.js
let BASE_URL = '';

if (typeof window !== 'undefined') {
  const savedUrl = localStorage.getItem('apiBaseUrl');
  if (savedUrl) {
    BASE_URL = savedUrl;
  }
}

export const getBatches = async () => {
  const url = `${BASE_URL}/batches`;
  return await secureFetch(url);
};
```

### ❌ Wrong (Hardcoded - NOT used)
```javascript
// DON'T DO THIS
const PW_BASE = 'https://apiserver-6hat.onrender.com';
```

## 📁 File Structure

### Active Files (Science and Fun)
```
src/
├── services/
│   └── apiService.js          ✅ Uses localStorage API URL
├── components/
│   ├── ScienceAndFun.jsx      ✅ Uses apiService.js
│   ├── AdminDashboard.jsx     ✅ Configures API URL
│   └── AdminPanel.jsx         ✅ Simple admin UI
└── App.jsx                    ✅ Renders ScienceAndFun
```

### Inactive Files (Reference Only)
```
src/components/
└── PhysicsWallah.jsx          ❌ NOT used in Science and Fun
                               ❌ Hardcoded URL removed

pages/api/pw/
├── batches.js                 ❌ NOT used in Science and Fun
├── video.js                   ❌ NOT used in Science and Fun
└── ...                        ❌ PW-specific, not used
```

## 🔐 Security Features

### 1. URL Validation
```javascript
const validateRequestUrl = (url) => {
  if (!url.startsWith(BASE_URL)) {
    throw new Error('Security Error');
  }
};
```

### 2. Generic Error Messages
```javascript
// User sees:
"Unable to load content. Please try again later."

// NOT:
"Failed to fetch from https://api.example.com/batches: 404 Not Found"
```

### 3. CORS Proxy
```javascript
// Uses Next.js proxy to avoid CORS
const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
```

## 📝 Configuration Steps

### For Admin
1. Login as admin (`adityaghoghari01@gmail.com`)
2. Go to `/aditya-ghoghari-admin`
3. Navigate to "API Settings" tab
4. Enter your API Base URL
5. Click "Save Configuration"
6. Click "Test Connection" to verify
7. Done! All users will now fetch from this API

### For Users
- No configuration needed
- API URL is already set by admin
- Just browse and enjoy content

## 🔄 Changing API URL

### Method 1: Admin Dashboard (Recommended)
1. Go to Admin Dashboard
2. API Settings tab
3. Enter new URL
4. Save

### Method 2: Browser Console (Development)
```javascript
localStorage.setItem('apiBaseUrl', 'https://your-new-api.com');
location.reload();
```

### Method 3: Clear and Reconfigure
```javascript
localStorage.removeItem('apiBaseUrl');
// Then set via Admin Dashboard
```

## 🧪 Testing

### Test API Connection
1. Admin Dashboard → API Settings
2. Click "Test Connection"
3. View results:
   - ✅ Success: API is working
   - ❌ Error: Check URL and API availability

### Verify Configuration
```javascript
// Browser console
console.log(localStorage.getItem('apiBaseUrl'));
// Should show your configured URL
```

## 🐛 Troubleshooting

### "Service temporarily unavailable"
- API Base URL not configured
- Go to Admin Dashboard and set URL

### "Unable to load content"
- API is down or unreachable
- Check API URL is correct
- Verify API is running

### Content not loading
- Check browser console for errors
- Verify API Base URL in localStorage
- Test API connection in Admin Dashboard

## 📊 API Response Format

Your API should return data in this format:

```json
{
  "data": [
    {
      "id": "123",
      "course_name": "Physics Class 12",
      "course_thumbnail": "https://...",
      "material_type": "FOLDER",
      "Title": "Chapter 1",
      "parent_id": null
    }
  ]
}
```

## ✨ Benefits

1. **No Code Changes** - Switch APIs without touching code
2. **Multi-Tenant** - Different users can use different APIs
3. **Secure** - URL validation on every request
4. **Fast** - 5-minute caching for better performance
5. **Clean** - No hardcoded URLs anywhere
6. **Flexible** - Works with any compatible API

## 🎉 Summary

- ✅ API URL configured via Admin Dashboard
- ✅ Stored in localStorage
- ✅ Used by apiService.js
- ✅ All components use apiService.js
- ✅ No hardcoded URLs in active code
- ✅ Secure and validated
- ✅ Easy to change anytime

**Science and Fun is 100% API-driven!** 🚀
