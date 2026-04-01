# 🔴 Live & Upcoming Classes Implementation

## ✅ Complete Implementation

### 🎯 Features Implemented

1. **Live Classes** ✅
   - Red "LIVE" badge (blinking)
   - Thumbnail display
   - "Watch Now" button
   - Opens player with `isLive=true`

2. **Upcoming Classes** ✅
   - Blue "UPCOMING" badge
   - Countdown timer (updates every minute)
   - Start date/time display
   - Auto-calculates time left

3. **Previous Live Videos** ✅
   - Thumbnail with play overlay
   - Date and duration
   - "Watch" button
   - Opens normal player

---

## 📡 API Integration

### 1. Live & Upcoming API
```javascript
GET /api/scienceandfun/live?course_id={course_id}

Response:
{
  live: [...],        // Currently live classes
  upcoming: [...]     // Scheduled classes
}
```

### 2. Previous Live API
```javascript
GET /api/scienceandfun/previous-live?course_id={course_id}

Response:
{
  data: [...]  // Past live recordings
}
```

---

## 🎨 UI Components

### 1. LiveClassCard.jsx
```jsx
<LiveClassCard 
  liveClass={class}
  onWatch={handleWatch}
/>
```

**Features:**
- Red blinking "LIVE" badge
- Thumbnail or gradient fallback
- Title (2-line clamp)
- Red "Watch Now" button

### 2. UpcomingClassCard.jsx
```jsx
<UpcomingClassCard 
  upcomingClass={class}
/>
```

**Features:**
- Blue "UPCOMING" badge
- Countdown timer (auto-updates)
- Start date/time
- Blue info box with time left

### 3. PreviousLiveCard.jsx
```jsx
<PreviousLiveCard 
  previousClass={class}
  onWatch={handleWatch}
  loading={isLoading}
/>
```

**Features:**
- Thumbnail with play overlay
- Date and duration
- Black "Watch" button
- Loading state

---

## 🔄 Tab System

### Main Tabs
```
[Content] [Live & Upcoming]
```

### Live Sub-Tabs
```
[Live & Upcoming] [Previous Live Videos]
```

**Behavior:**
- Click "Live & Upcoming" → Loads live/upcoming data
- Click "Previous Live Videos" → Loads previous recordings
- Lazy loading (only when tab is clicked)

---

## 🎯 Functionality

### Live Class Watch
```javascript
handleLiveWatch(liveClass) {
  const playerUrl = `/player?course_id=${batchId}&video_id=${videoId}&isLive=true`;
  window.open(playerUrl, '_blank');
}
```

### Previous Live Watch
```javascript
handlePreviousLiveWatch(previousClass) {
  // Fetch video details
  const details = await getVideoDetails(videoId, batchId);
  
  // Build clean URL (no duplicate tokens)
  const videoUrl = buildVideoUrl(playerUrl, token);
  
  // Open player
  window.open(videoUrl, '_blank');
}
```

---

## ⏱️ Countdown Timer

```javascript
useEffect(() => {
  const calculateTimeLeft = () => {
    const startTime = new Date(upcomingClass.start_time);
    const now = new Date();
    const diff = startTime - now;

    if (diff <= 0) {
      setTimeLeft('Starting soon...');
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeLeft(`Starts in: ${hours}h ${minutes}m`);
  };

  calculateTimeLeft();
  const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

  return () => clearInterval(interval);
}, [upcomingClass]);
```

---

## 🎨 Design System

### Colors
```css
Live Badge:      bg-red-600 (with animate-pulse)
Upcoming Badge:  bg-blue-600
Watch Now:       bg-red-600 hover:bg-red-700
Watch:           bg-black hover:bg-gray-900
Countdown Box:   bg-blue-50 text-blue-700
```

### Animations
```css
Live Badge:      animate-pulse
Live Dot:        animate-ping
Countdown:       Updates every 60 seconds
```

### Grid Layout
```css
Desktop:  4 columns (xl:grid-cols-4)
Tablet:   3 columns (lg:grid-cols-3)
Mobile:   2 columns (sm:grid-cols-2)
Small:    1 column  (grid-cols-1)
```

---

## 📊 State Management

```javascript
// Live & Upcoming states
const [liveSubTab, setLiveSubTab] = useState('live');
const [liveClasses, setLiveClasses] = useState([]);
const [upcomingClasses, setUpcomingClasses] = useState([]);
const [previousLiveClasses, setPreviousLiveClasses] = useState([]);
const [loadingLive, setLoadingLive] = useState(false);
```

---

## 🔄 Lazy Loading

```javascript
// Only load when tab is clicked
const handleTabChange = (tab) => {
  setActiveTab(tab);
  if (tab === 'live') {
    loadLiveClasses(); // Lazy load
  }
};

// Only load previous when sub-tab is clicked
const handleLiveSubTabChange = (subTab) => {
  setLiveSubTab(subTab);
  if (subTab === 'previous') {
    loadPreviousLiveClasses(); // Lazy load
  }
};
```

---

## 🛡️ Error Handling

```javascript
try {
  const response = await getLiveClasses(batchId);
  const live = response.live || response.data?.live || [];
  const upcoming = response.upcoming || response.data?.upcoming || [];
  
  setLiveClasses(live);
  setUpcomingClasses(upcoming);
} catch (error) {
  console.error('Error loading live classes:', error);
  setMessage('❌ Failed to load live classes');
}
```

---

## 📱 Responsive Design

### Mobile
- 1-2 columns
- Stacked layout
- Touch-friendly buttons
- Readable countdown

### Tablet
- 2-3 columns
- Balanced spacing
- Hover effects

### Desktop
- 3-4 columns
- Full features
- Smooth animations

---

## ✅ Checklist

### API Integration ✅
- [x] Live & Upcoming API
- [x] Previous Live API
- [x] Lazy loading
- [x] Error handling

### UI Components ✅
- [x] LiveClassCard
- [x] UpcomingClassCard
- [x] PreviousLiveCard
- [x] Blinking LIVE badge
- [x] Countdown timer

### Functionality ✅
- [x] Tab system
- [x] Sub-tab system
- [x] Live class watch
- [x] Previous live watch
- [x] Loading states
- [x] Empty states

### Design ✅
- [x] Red LIVE badge
- [x] Blue UPCOMING badge
- [x] Countdown display
- [x] Grid layouts
- [x] Responsive
- [x] Animations

---

## 🚀 Usage

### 1. Click "Live & Upcoming" Tab
- Automatically loads live/upcoming data
- Shows loading spinner
- Displays cards in grid

### 2. View Live Classes
- Red blinking badge
- Click "Watch Now"
- Opens player with `isLive=true`

### 3. View Upcoming Classes
- Blue badge
- Countdown timer
- Start date/time

### 4. Click "Previous Live Videos"
- Loads previous recordings
- Shows thumbnails
- Click "Watch" to play

---

## 🎉 Result

**A complete Live & Upcoming system with:**
- ✅ Real-time live classes
- ✅ Countdown timers
- ✅ Previous recordings
- ✅ Clean API integration
- ✅ Lazy loading
- ✅ Error handling
- ✅ Responsive design
- ✅ Modern UI

**Production ready!** 🔴✨
