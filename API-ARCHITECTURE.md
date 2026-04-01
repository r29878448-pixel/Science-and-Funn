# 🚀 Fully API-Driven Architecture

## Overview
This application is built with a **strict API-only architecture** - NO Firebase, NO static data, NO hardcoded providers.

All data (videos, PDFs, courses, metadata) is fetched dynamically from a single configurable API Base URL.

---

## ✅ Key Features

### 1. **Single Source of Truth**
- All data comes from ONE configurable API Base URL
- No Firebase, no Firestore, no Firebase Storage
- No hardcoded data sources

### 2. **Dynamic Base URL Control**
- Admin can set/change API Base URL at runtime
- Stored in `localStorage` (browser-side only)
- No code changes needed to switch data sources

### 3. **Security & Validation**
- All API requests are validated against the configured Base URL
- Prevents accidental or malicious requests to other domains
- Centralized security layer in `apiService.js`

### 4. **Clean Architecture**
```
src/services/apiService.js  → Centralized API layer
src/components/AdminPanel.jsx → API configuration UI
src/components/ScienceAndFun.jsx → Dynamic course listing
pages/batch/[batchId].jsx → Dynamic batch content
```

---

## 🔧 How It Works

### Step 1: Configure API Base URL
1. Go to **Admin Panel** (⚙️ button in navbar)
2. Enter your API Base URL (e.g., `https://your-api.com/api`)
3. Click **Save API URL**
4. Click **Test Connection** to verify

### Step 2: Data Flow
```
Admin Panel → Set Base URL → localStorage
                ↓
        apiService.js loads URL
                ↓
    All components use apiService
                ↓
        Data fetched from API
                ↓
        Rendered dynamically
```

### Step 3: API Endpoints Used
```
GET /batches                    → List all courses
GET /content?course_id=X        → Get course root folder
GET /content?course_id=X&parent_id=Y → Get folder content
GET /video-details?video_id=V&course_id=X → Get video URL
GET /previous-live?course_id=X  → Get live classes
```

---

## 📁 File Structure

### Core Files
- **`src/services/apiService.js`** - Centralized API service with security validation
- **`src/components/AdminPanel.jsx`** - API configuration & testing UI
- **`src/components/ScienceAndFun.jsx`** - Dynamic course listing
- **`pages/batch/[batchId].jsx`** - Dynamic batch content viewer

### Removed/Disabled
- **`src/services/firebaseService.js`** - All functions throw errors
- **`src/firebase.js`** - Not used (can be removed)
- **`src/components/PhysicsWallah.jsx`** - Removed (hardcoded provider)
- **`src/components/Profile.jsx`** - Removed (not needed)

---

## 🔒 Security Features

### 1. URL Validation
```javascript
const validateRequestUrl = (url) => {
  if (!url.startsWith(BASE_URL)) {
    throw new Error('Security Error: URL does not match Base URL');
  }
};
```

### 2. Base URL Enforcement
- All API calls go through `secureFetch()`
- Validates URL before making request
- Prevents requests to unauthorized domains

### 3. CORS Handling
- Uses Next.js proxy (`/api/proxy`) to avoid CORS issues
- Proxy validates and forwards requests

---

## 🎯 Usage Examples

### Admin Panel
```javascript
// Set API URL
updateApiUrl('https://your-api.com/api');

// Test connection
const batches = await getBatches();
console.log(`Found ${batches.length} batches`);
```

### Frontend Components
```javascript
// Load courses
const response = await getBatches();
const courses = response.data || response;

// Load batch content
const content = await fetchAllBatchContent(batchId);

// Get video details
const videoDetails = await getVideoDetails(videoId, batchId);
```

---

## 🚫 What's NOT Allowed

❌ Firebase/Firestore calls
❌ Static JSON data files
❌ Hardcoded API URLs in components
❌ Multiple data sources
❌ Fallback APIs

---

## ✅ What IS Allowed

✅ Single configurable API Base URL
✅ Dynamic data fetching
✅ localStorage for URL persistence
✅ Centralized API service
✅ Security validation

---

## 🔄 Changing Data Source

To switch to a different API:

1. Go to Admin Panel
2. Enter new API Base URL
3. Click Save
4. All data will now come from new API
5. No code changes needed!

---

## 📊 API Response Format

### Batches Response
```json
{
  "data": [
    {
      "id": "123",
      "course_name": "Physics Class 12",
      "course_thumbnail": "https://..."
    }
  ]
}
```

### Content Response
```json
{
  "data": [
    {
      "id": "456",
      "Title": "Chapter 1",
      "material_type": "FOLDER",
      "parent_id": null
    },
    {
      "id": "789",
      "Title": "Video 1",
      "material_type": "VIDEO",
      "parent_id": "456"
    }
  ]
}
```

### Video Details Response
```json
{
  "data": {
    "video_player_url": "https://player.example.com/video",
    "video_player_token": "abc123...",
    "video_thumbnail": "https://..."
  }
}
```

---

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

---

## 📝 Notes

- API Base URL is stored in browser `localStorage`
- URL persists across page refreshes
- Each user can configure their own API URL
- No server-side storage needed
- Fully client-side configuration

---

## 🎉 Benefits

1. **Plug & Play** - Change API URL without code changes
2. **Secure** - URL validation prevents unauthorized requests
3. **Clean** - Single source of truth for all data
4. **Flexible** - Works with any API that matches the endpoint structure
5. **Simple** - No complex backend configuration

---

## 🚀 Ready to Use!

1. Set your API Base URL in Admin Panel
2. Test the connection
3. Browse courses
4. Watch videos
5. Everything is dynamic!

**No Firebase. No Static Data. Pure API-Driven Architecture.** ✨
