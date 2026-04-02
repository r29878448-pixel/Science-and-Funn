import React, { useState, useEffect } from 'react';

// Live Class Card with blinking LIVE badge
export const LiveClassCard = ({ liveClass, onWatch }) => {
  // Format date and time - "Created on: 04 Apr 2026, 05:00 PM"
  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      const dateStr = date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      return `Created on: ${dateStr}, ${timeStr}`;
    } catch (e) {
      return null;
    }
  };

  const dateTimeStr = formatDateTime(
    liveClass.start_time || 
    liveClass.startTime || 
    liveClass.scheduled_at || 
    liveClass.created_at
  );

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative w-full h-40 bg-gray-200">
        {liveClass.thumbnail || liveClass.video_thumbnail ? (
          <img 
            src={liveClass.thumbnail || liveClass.video_thumbnail}
            alt={liveClass.title || liveClass.Title}
            className="w-full h-full object-cover"
            onError={(e) => e.target.style.display = 'none'}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
            </svg>
          </div>
        )}
        
        {/* LIVE Badge - Blinking */}
        <div className="absolute top-2 left-2">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></span>
            LIVE
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
          {liveClass.title || liveClass.Title || liveClass.name}
        </h3>

        {/* Date and Time */}
        {dateTimeStr && (
          <div className="mb-3 text-xs text-gray-600">
            {dateTimeStr}
          </div>
        )}

        {/* Watch Now Button */}
        <button 
          onClick={() => onWatch(liveClass)}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
        >
          Watch Now
        </button>
      </div>
    </div>
  );
};

// Upcoming Class Card with countdown
export const UpcomingClassCard = ({ upcomingClass }) => {
  const [countdown, setCountdown] = useState('');

  // Calculate countdown
  useEffect(() => {
    const calculateCountdown = () => {
      const startTime = upcomingClass.start_time || 
                       upcomingClass.startTime || 
                       upcomingClass.scheduled_at;
      
      if (!startTime) return;

      const targetDate = new Date(startTime);
      if (isNaN(targetDate.getTime())) return;

      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setCountdown('Starting soon...');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [upcomingClass]);

  // Format "Live on: 04-04-2026 at 05:00 pm"
  const formatLiveDateTime = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours % 12 || 12;
      
      return `Live on: ${day}-${month}-${year} at ${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
    } catch (e) {
      return null;
    }
  };

  const liveDateTime = formatLiveDateTime(
    upcomingClass.start_time || 
    upcomingClass.startTime || 
    upcomingClass.scheduled_at
  );

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative w-full h-40 bg-gray-200">
        {upcomingClass.thumbnail || upcomingClass.video_thumbnail ? (
          <img 
            src={upcomingClass.thumbnail || upcomingClass.video_thumbnail}
            alt={upcomingClass.title || upcomingClass.Title}
            className="w-full h-full object-cover"
            onError={(e) => e.target.style.display = 'none'}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
          </div>
        )}
        
        {/* Upcoming Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            UPCOMING
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
          {upcomingClass.title || upcomingClass.Title || upcomingClass.name}
        </h3>

        {/* Live Date and Time */}
        {liveDateTime && (
          <div className="mb-2 text-xs text-gray-700 font-medium">
            {liveDateTime}
          </div>
        )}

        {/* Countdown Timer */}
        {countdown && (
          <div className="bg-blue-50 text-blue-700 text-sm font-bold py-2 px-3 rounded text-center mb-2">
            Starts in: {countdown}
          </div>
        )}

        {/* Upcoming Badge (fallback if no countdown) */}
        {!countdown && (
          <div className="bg-blue-50 text-blue-700 text-sm font-medium py-2 px-3 rounded text-center">
            Upcoming
          </div>
        )}
      </div>
    </div>
  );
};

// Previous Live Class Card
export const PreviousLiveCard = ({ previousClass, onWatch, loading }) => {
  // Format date and time - "Created on: 04 Apr 2026, 05:00 PM"
  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      const dateStr = date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      return `Created on: ${dateStr}, ${timeStr}`;
    } catch (e) {
      return null;
    }
  };

  const dateTimeStr = formatDateTime(
    previousClass.start_time || 
    previousClass.startTime || 
    previousClass.created_at ||
    previousClass.scheduled_at
  );

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="w-full h-40 bg-gray-200 relative overflow-hidden group">
        {previousClass.thumbnail || previousClass.video_thumbnail ? (
          <>
            <img 
              src={previousClass.thumbnail || previousClass.video_thumbnail}
              alt={previousClass.title || previousClass.Title}
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
            {/* Play Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
          {previousClass.title || previousClass.Title || previousClass.name}
        </h3>

        {/* Date and Time */}
        {dateTimeStr && (
          <div className="mb-3 text-xs text-gray-600">
            {dateTimeStr}
          </div>
        )}

        {/* Watch Button */}
        <button 
          onClick={() => onWatch(previousClass)}
          disabled={loading}
          className="w-full bg-black hover:bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Watch'}
        </button>
      </div>
    </div>
  );
};

export default { LiveClassCard, UpcomingClassCard, PreviousLiveCard };
