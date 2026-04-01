# Science and Fun API Documentation

## Overview
Complete API endpoints used in Science and Fun application with data flow structure.

## Base URL Configuration
- **Dynamic**: Set from Admin Panel
- **Firebase Storage**: API URL saved in Firebase config
- **Runtime Updates**: Changes apply immediately

## API Endpoints

### 1. Get All Batches
```
GET {BASE_URL}/batches
```

**Purpose**: Fetch all available courses/batches

**Response Structure**:
```json
{
  "status": 200,
  "data": [
    {
      "id": "126",
      "title": "Class 10 Physics",
      "image": "https://example.com/thumbnail.jpg",
      "banner": "https://example.com/banner.jpg",
      "description": "Complete physics course"
    }
  ]
}
```

**Used For**: Homepage batch cards display

---

### 2. Get Content Root
```
GET {BASE_URL}/content?course_id={batchId}
```

**Purpose**: Get root folder ID for a batch

**Parameters**:
- `course_id`: Batch ID (e.g., "126")

**Response Structure**:
```json
{
  "status": 200,
  "data": [
    {
      "id": "36113",
      "material_type": "FOLDER",
      "Title": "Course Content",
      "name": "Course Content"
    }
  ]
}
```

**Used For**: Starting point for content navigation

---

### 3. Get Folder Content
```
GET {BASE_URL}/content?course_id={batchId}&parent_id={folderId}
```

**Purpose**: Get items inside a folder

**Parameters**:
- `course_id`: Batch ID
- `parent_id`: Folder ID

**Response Structure**:
```json
{
  "status": 200,
  "data": [
    {
      "id": "36713",
      "material_type": "FOLDER",
      "Title": "Chapter 1: Introduction",
      "name": "Chapter 1: Introduction"
    },
    {
      "id": "99148",
      "material_type": "VIDEO",
      "Title": "Introduction Video",
      "name": "Introduction Video"
    }
  ]
}
```

**Used For**: Displaying folder contents and videos

---

### 4. Get Video Details
```
GET {BASE_URL}/video-details?video_id={videoId}&course_id={batchId}
```

**Purpose**: Get video player URL and token

**Parameters**:
- `video_id`: Video ID
- `course_id`: Batch ID

**Response Structure**:
```json
{
  "status": 200,
  "data": {
    "Title": "Introduction to Course",
    "video_player_url": "https://player.classx.co.in/secure-player?isMobile=true&token=",
    "video_player_token": "4a5e33e65512cb0b5168a39196deed34",
    "expires_at": "2026-03-27T10:30:00Z"
  }
}
```

**Used For**: Video player initialization and token refresh

---

### 5. Get Live Classes
```
GET {BASE_URL}/previous-live?course_id={batchId}
```

**Purpose**: Get past live classes for a batch

**Parameters**:
- `course_id`: Batch ID

**Response Structure**:
```json
{
  "status": 200,
  "data": [
    {
      "title": "Live Class - Introduction",
      "video_id": "live-123",
      "scheduled_at": "2026-03-20T10:00:00Z"
    },
    {
      "title": "Live Class - Advanced Topics",
      "video_id": "live-456",
      "scheduled_at": "2026-03-22T14:00:00Z"
    }
  ]
}
```

**Used For**: Live classes section

---

## Data Flow Architecture

### Complete Flow:
```
1. Admin Panel → Set API URL → Firebase Config
2. App Load → Get API URL from Firebase
3. API Call → Fetch Data → Firebase Storage
4. Firebase → Display in UI
5. User Interaction → API Calls → Firebase → UI Updates
```

### Batch Content Flow:
```
Batches API → Course ID → Content Root API → Root Folder ID → 
Folder Content API → Videos/Folders → Video Details API → Video Player
```

## Error Handling

### CORS Issues:
- **Direct API**: First attempt
- **Proxy Fallback**: `/api/proxy?url={encoded_url}`
- **Mock Data**: Final fallback

### Common Errors:
- **404**: API endpoint not found
- **CORS**: Origin not allowed
- **503**: Service unavailable
- **Token Expired**: Video player token invalid

## Firebase Integration

### Collections:
- **config/api**: API configuration
- **batches**: Batch data with thumbnails
- **content**: Batch content structure
- **videos**: Video details with tokens

### Data Structure:
```javascript
// Batch Document
{
  id: "126",
  title: "Class 10 Physics",
  image: "https://...",
  thumbnail: "https://...",
  content: {
    folders: [...],
    videos: [...]
  }
}
```

## Video Player Integration

### ClassX Player:
```
Player URL: https://player.classx.co.in/secure-player?isMobile=true&token={token}
Token Refresh: Call video-details API for new token
```

### YouTube Fallback:
```
URL: https://www.youtube.com/watch?v={videoId}
Embed: https://www.youtube.com/embed/{videoId}
```

## Admin Panel Features

### API Configuration:
- **Current URL Display**: Shows active API
- **URL Update**: Change API endpoint
- **Reset Function**: Clear to empty
- **Status Display**: Connection status

### System Status:
- **Firebase**: Connection status
- **API**: Health check
- **Endpoints**: All available paths

## Development Notes

### Environment Variables:
- No hardcoded URLs
- Dynamic API configuration
- Firebase-based config storage

### Proxy Configuration:
- Handles CORS issues
- Mock data fallback
- Timeout handling (30s)

### Caching Strategy:
- Firebase as primary cache
- API as data source
- Real-time updates available

## Troubleshooting

### Common Issues:
1. **Empty Batches**: Check API URL in admin panel
2. **No Thumbnails**: Verify API response structure
3. **Video Not Playing**: Check token expiration
4. **CORS Errors**: Proxy should handle automatically

### Debug Steps:
1. Check admin panel API URL
2. Verify API response in console
3. Check Firebase storage
4. Test individual endpoints

---

**Last Updated**: March 29, 2026
**Version**: 1.0.0
