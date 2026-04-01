# 🎓 Science & Fun - Fully API-Driven Learning Platform

A modern, fully API-driven frontend application for educational content delivery with **beautiful card layouts** and **smart URL handling**. **Zero Firebase dependencies, zero static data, zero duplicate tokens** - everything is fetched dynamically from a configurable API endpoint.

---

## ✨ Key Features

### 🌐 **100% API-Driven**
- All data fetched from single configurable API Base URL
- No Firebase, no Firestore, no static JSON files
- Switch data sources without code changes

### 🎴 **Modern Card Layout**
- Beautiful gradient cards for courses
- Horizontal cards with thumbnails for content
- Video preview images with play overlay
- Smooth hover animations and transitions
- Responsive grid (mobile/tablet/desktop)

### 🔒 **Smart URL Handling**
- **NO duplicate query parameters** (especially `token`)
- Utility functions prevent `?token=&token=abc123`
- Clean URL construction: `buildVideoUrl(url, token)`
- Automatic normalization and validation

### 💀 **Loading Skeletons**
- Smooth loading experience
- No jarring content shifts
- Professional appearance
- Better perceived performance

### 🎥 **Rich Video Support**
- Video thumbnails displayed
- Play button overlay on hover
- Loading spinner while fetching
- Opens in new tab with clean URL
- Token added only once

### 📄 **PDF Handling**
- PDF cards with icons
- Click to open in new tab
- File size display
- Consistent card design

### ⚙️ **Dynamic Configuration**
- Admin panel for API URL management
- Runtime configuration changes
- Browser-based persistence (localStorage)

### 📱 **Responsive & Modern**
- Mobile-first design
- Tailwind CSS styling
- Smooth animations
- Touch-friendly

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Configure API
1. Open http://localhost:3000
2. Click **⚙️ Admin Panel**
3. Enter your API Base URL
4. Click **Save** and **Test Connection**

### 4. Start Using
- Browse courses
- View content
- Watch videos
- Everything is dynamic!

---

## 📋 API Requirements

Your API must support these endpoints:

```
GET /batches
→ Returns list of all courses/batches

GET /content?course_id={id}
→ Returns root folder content for a course

GET /content?course_id={id}&parent_id={folderId}
→ Returns content inside a specific folder

GET /video-details?video_id={id}&course_id={id}
→ Returns video streaming URL and token

GET /previous-live?course_id={id}
→ Returns live class recordings (optional)
```

### Expected Response Format
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

---

## 🏗️ Architecture

### Core Components

```
src/
├── services/
│   ├── apiService.js          # Centralized API layer
│   └── firebaseService.js     # Disabled (throws errors)
├── components/
│   ├── AdminPanel.jsx         # API configuration UI
│   ├── ScienceAndFun.jsx      # Course listing
│   └── Navbar.jsx             # Navigation
└── App.jsx                    # Main app component

pages/
├── batch/
│   └── [batchId].jsx          # Dynamic batch viewer
└── api/
    └── proxy.js               # CORS proxy
```

### Data Flow

```
Admin Panel → Set API URL → localStorage
                ↓
        apiService loads URL
                ↓
    Components fetch via apiService
                ↓
        Secure validation
                ↓
        Proxy handles CORS
                ↓
        API returns data
                ↓
        UI renders dynamically
```

---

## 🔒 Security Features

### 1. URL Validation
```javascript
// Only configured Base URL is allowed
validateRequestUrl(url) {
  if (!url.startsWith(BASE_URL)) {
    throw new Error('Security Error');
  }
}
```

### 2. Centralized API Layer
- All requests go through `apiService.js`
- No direct API calls from components
- Consistent error handling

### 3. CORS Handling
- Next.js proxy prevents CORS issues
- Validates and forwards requests
- Secure by default

---

## 📖 Documentation

- **[Quick Start Guide](QUICK-START.md)** - Get started in 3 steps
- **[API Architecture](API-ARCHITECTURE.md)** - Detailed architecture docs
- **[Implementation Summary](IMPLEMENTATION-SUMMARY.md)** - What was built
- **[Upgrade Summary](UPGRADE-SUMMARY.md)** - New UI/UX features & URL fixes

---

## 🎯 Use Cases

### Educational Platforms
- Online courses
- Video lectures
- Study materials
- Live classes

### Content Delivery
- Dynamic content loading
- Multi-tenant support
- White-label solutions

### API Integration
- Connect to any compatible API
- Switch providers easily
- No vendor lock-in

---

## 🛠️ Development

### Build for Production
```bash
npm run build
npm start
```

### Environment
- No environment variables needed
- API URL configured in browser
- Each user can use different API

### Testing
1. Set API URL in Admin Panel
2. Click "Test Connection"
3. View test results
4. Browse batches

---

## 📦 Tech Stack

- **Framework:** Next.js 14
- **UI:** React 18
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Storage:** localStorage (browser)

---

## 🚫 What's NOT Used

- ❌ Firebase/Firestore
- ❌ Firebase Storage
- ❌ Static JSON data
- ❌ Hardcoded API URLs
- ❌ Multiple data sources
- ❌ Backend database

---

## ✅ Benefits

1. **Plug & Play** - Change API without code changes
2. **Secure** - URL validation prevents abuse
3. **Clean** - Single source of truth
4. **Flexible** - Works with any compatible API
5. **Simple** - Easy to understand and maintain
6. **Fast** - Direct API calls, no middleware
7. **Scalable** - No backend complexity

---

## 🎨 Screenshots

### Admin Panel
Configure your API Base URL and test connection

### Course Listing
Browse all available courses dynamically

### Batch Content
View hierarchical content structure with folders and videos

---

## 🔄 Switching APIs

Want to use a different API? Just:

1. Go to Admin Panel
2. Enter new API Base URL
3. Save
4. Done!

No code changes, no deployment, no restart needed.

---

## 📞 Support

### Common Issues

**"API not configured"**
→ Set API URL in Admin Panel

**"Failed to fetch"**
→ Check API URL is correct and accessible

**"CORS error"**
→ Proxy should handle this automatically

### Need Help?
Check the documentation files or review the code in `src/services/apiService.js`

---

## 🎉 Ready to Use!

This application is production-ready and fully functional. Just configure your API URL and start using it!

**No Firebase. No Static Data. Pure API-Driven Architecture.** ✨

---

## 📄 License

MIT License - Feel free to use and modify

---

## 🙏 Credits

Built with modern web technologies and best practices for API-driven architectures.
