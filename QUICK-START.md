# 🚀 Quick Start Guide

## Get Started in 3 Steps

### Step 1: Install & Run
```bash
npm install
npm run dev
```

### Step 2: Configure API
1. Open http://localhost:3000
2. Click **⚙️ Admin Panel** in navbar
3. Enter your API Base URL (e.g., `https://deltaserver-vvcb.onrender.com/api/scienceandfun`)
4. Click **💾 Save API URL**
5. Click **🧪 Test Connection**

### Step 3: Browse Content
1. Click **📚 Courses** in navbar
2. Browse available courses
3. Click on any course to view content
4. Click videos to watch

---

## 📋 Requirements

### Your API Must Support:
```
GET /batches                              → List courses
GET /content?course_id=X                  → Get course root
GET /content?course_id=X&parent_id=Y      → Get folder content
GET /video-details?video_id=V&course_id=X → Get video URL
```

### Response Format:
```json
{
  "data": [
    { "id": "123", "course_name": "Course Name", ... }
  ]
}
```

---

## 🔧 Configuration

### Set API URL (Admin Panel):
- Go to Admin Panel
- Enter: `https://your-api.com/api`
- Save and test

### Or Programmatically:
```javascript
import { updateApiUrl } from './src/services/apiService';
updateApiUrl('https://your-api.com/api');
```

---

## 📁 Key Files

```
src/services/apiService.js       → API layer
src/components/AdminPanel.jsx    → Config UI
src/components/ScienceAndFun.jsx → Course list
pages/batch/[batchId].jsx        → Batch viewer
```

---

## ✅ Features

- ✅ Fully API-driven (no Firebase)
- ✅ Dynamic Base URL configuration
- ✅ Security validation
- ✅ Recursive content loading
- ✅ Video streaming support
- ✅ PDF/Quiz ready
- ✅ Mobile responsive

---

## 🚫 What's NOT Used

- ❌ Firebase/Firestore
- ❌ Static JSON files
- ❌ Hardcoded URLs
- ❌ Multiple data sources

---

## 🎯 Example API URLs

```
Production: https://your-api.com/api
Staging:    https://staging-api.com/api
Local:      http://localhost:8000/api
```

Just change the URL in Admin Panel - no code changes needed!

---

## 🆘 Troubleshooting

### "API not configured"
→ Go to Admin Panel and set API Base URL

### "Failed to fetch batches"
→ Check API URL is correct
→ Test connection in Admin Panel
→ Check API is running

### "CORS error"
→ App uses Next.js proxy automatically
→ Check `/api/proxy.js` is working

---

## 📞 Support

Check these files for details:
- `API-ARCHITECTURE.md` - Full architecture docs
- `IMPLEMENTATION-SUMMARY.md` - What was built
- `src/services/apiService.js` - API code

---

## 🎉 That's It!

Your app is now fully API-driven. Change the API URL anytime without touching code!
