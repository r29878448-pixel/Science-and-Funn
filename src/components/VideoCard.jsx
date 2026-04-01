import React from 'react';

// Exact replica of screenshot video cards
const VideoCard = ({ video, onWatch, loading }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail - Top */}
      <div className="w-full h-40 bg-gray-200 relative overflow-hidden group">
        {video.video_thumbnail || video.thumbnail ? (
          <>
            <img 
              src={video.video_thumbnail || video.thumbnail}
              alt={video.Title || video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
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
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
          {video.Title || video.title || video.name}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
          {video.created_at && (
            <span>{new Date(video.created_at).toLocaleDateString()}</span>
          )}
          {video.duration && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {video.duration}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          {/* Watch Button - Black */}
          <button 
            onClick={() => onWatch(video)}
            disabled={loading}
            className="w-full bg-black hover:bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Watch'}
          </button>

          {/* View PDF Button (if available) */}
          {video.has_pdf && (
            <button className="w-full bg-white hover:bg-gray-50 text-black text-sm font-medium py-2 px-4 rounded border border-gray-300 transition-colors">
              View PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
