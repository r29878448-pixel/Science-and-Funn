import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getVideoDetails, buildVideoUrl } from '../src/services/apiService';
import { useVideoWatchTracker } from '../src/hooks/useVideoWatchTracker';
import { onAuthChange } from '../src/services/authService';

const PlayerPage = () => {
  const router = useRouter();
  const { course_id, video_id, isLive } = router.query;
  
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const playerContainerRef = React.useRef(null);
  const controlsTimeoutRef = React.useRef(null);
  const iframeRef = React.useRef(null);
  const videoRef = React.useRef(null);

  // XP tracking
  const {
    watchTime,
    xpEarned,
    isTracking,
    startTracking,
    stopTracking,
    progress,
    nextXpIn
  } = useVideoWatchTracker(currentUser?.uid, video_id, course_id);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      console.log('🔐 Auth state:', user ? user.email : 'Not logged in');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (course_id && video_id) {
      loadVideoUrl();
    }
  }, [course_id, video_id]);

  // Auto-fullscreen on load
  useEffect(() => {
    if (videoUrl && !loading && !error) {
      // Try to enter fullscreen automatically
      setTimeout(() => {
        enterFullscreen();
      }, 500);
    }
  }, [videoUrl, loading, error]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isFullscreen) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isFullscreen]);

  // Keyboard support (ESC to exit fullscreen)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  // Handle video play/pause for XP tracking
  const handleVideoPlay = () => {
    console.log('▶️ Video playing');
    startTracking();
  };

  const handleVideoPause = () => {
    console.log('⏸️ Video paused');
    stopTracking();
  };

  const handleVideoEnded = () => {
    console.log('⏹️ Video ended');
    stopTracking();
  };

  // Attach event listeners to video/iframe
  useEffect(() => {
    if (!videoUrl) return;

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('play', handleVideoPlay);
      videoElement.addEventListener('pause', handleVideoPause);
      videoElement.addEventListener('ended', handleVideoEnded);

      return () => {
        videoElement.removeEventListener('play', handleVideoPlay);
        videoElement.removeEventListener('pause', handleVideoPause);
        videoElement.removeEventListener('ended', handleVideoEnded);
      };
    }
  }, [videoUrl]);

  const loadVideoUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎥 Loading video:', { course_id, video_id, isLive });
      
      // Fetch video details from API
      const response = await getVideoDetails(video_id, course_id);
      console.log('✅ Video details:', response);
      
      if (!response?.data) {
        throw new Error('No video data received');
      }
      
      const data = response.data;
      
      // Extract video URL and token
      const playerUrl = data.video_player_url || data.player_url || data.url || '';
      const token = data.video_player_token || data.token || '';
      
      if (!playerUrl) {
        throw new Error('Video URL not available');
      }
      
      // Build clean URL with token (no duplicates)
      let finalUrl = playerUrl;
      if (token) {
        finalUrl = buildVideoUrl(playerUrl, token);
      }
      
      console.log('🎬 Final video URL:', finalUrl);
      
      // Store video info
      setVideoInfo({
        title: data.title || data.Title || 'Video',
        thumbnail: data.video_thumbnail || data.thumbnail,
        duration: data.duration,
        description: data.description
      });
      
      // Set the ORIGINAL URL (no modifications)
      setVideoUrl(finalUrl);
      
    } catch (err) {
      console.error('❌ Error loading video:', err);
      setError(err.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const isIframeUrl = (url) => {
    // Check if URL is a player URL (needs iframe)
    return url && (
      url.includes('player.') || 
      url.includes('/player') ||
      url.includes('classx.co.in') ||
      url.includes('vimeo.com') ||
      url.includes('youtube.com') ||
      url.includes('youtu.be')
    );
  };

  const isDirectVideo = (url) => {
    // Check if URL is a direct video file
    return url && (
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.endsWith('.ogg') ||
      url.endsWith('.m3u8')
    );
  };

  // Enter fullscreen
  const enterFullscreen = async () => {
    try {
      const element = playerContainerRef.current;
      if (!element) return;

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else {
        // Fallback: full viewport
        console.log('Fullscreen API not supported, using fallback');
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      // Fallback: full viewport
      setIsFullscreen(true);
    }
  };

  // Exit fullscreen
  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      } else {
        // Fallback mode
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Exit fullscreen failed:', err);
      setIsFullscreen(false);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (isFullscreen || document.fullscreenElement) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-white text-xl font-semibold mb-2">Error Loading Video</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Hide in fullscreen */}
      {!isFullscreen && (
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-white hover:text-gray-300 flex items-center transition"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            {isLive === 'true' && (
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                <span className="text-red-600 font-semibold text-sm">LIVE</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Container */}
      <div 
        ref={playerContainerRef}
        className={`relative ${isFullscreen ? 'w-screen h-screen' : 'max-w-7xl mx-auto'}`}
        onMouseMove={handleMouseMove}
        style={isFullscreen ? { position: 'fixed', top: 0, left: 0, zIndex: 9999 } : {}}
      >
        {/* Video Player */}
        <div className={`relative w-full ${isFullscreen ? 'h-full' : ''}`} style={!isFullscreen ? { paddingTop: '56.25%' } : {}}>
          {videoUrl && (
            <>
              {isIframeUrl(videoUrl) ? (
                // Use iframe for player URLs
                <iframe
                  src={videoUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                />
              ) : isDirectVideo(videoUrl) ? (
                // Use video tag for direct video files
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  controls
                  autoPlay
                  controlsList="nodownload"
                  title="Video Player"
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnded}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                // Fallback to iframe
                <iframe
                  src={videoUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                />
              )}
            </>
          )}

          {/* Fullscreen Controls Overlay */}
          {isFullscreen && (
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ pointerEvents: showControls ? 'auto' : 'none' }}
            >
              <div className="flex items-center justify-between">
                {/* Left: Video Title & Live Badge */}
                <div className="flex items-center space-x-4">
                  {isLive === 'true' && (
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                      <span className="text-red-600 font-semibold text-sm">LIVE</span>
                    </div>
                  )}
                  {videoInfo && (
                    <h3 className="text-white text-sm font-medium truncate max-w-md">
                      {videoInfo.title}
                    </h3>
                  )}
                </div>

                {/* Right: Fullscreen Toggle Button */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-gray-300 transition p-2 rounded hover:bg-white/10"
                  title="Exit Fullscreen (ESC)"
                >
                  {/* Compress/Exit Fullscreen Icon */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* XP Progress Indicator (Top-right, not in fullscreen) */}
          {!isFullscreen && currentUser && isTracking && (
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-xs text-gray-300">Earning XP</p>
                    <p className="text-sm font-bold">+{xpEarned} XP</p>
                  </div>
                </div>
                <div className="border-l border-gray-600 pl-3">
                  <p className="text-xs text-gray-300">Next XP in</p>
                  <p className="text-sm font-bold">{Math.floor(nextXpIn / 60)}:{String(nextXpIn % 60).padStart(2, '0')}</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Fullscreen Toggle Button (when not in fullscreen) */}
          {!isFullscreen && videoUrl && (
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition p-2 rounded bg-black/50 hover:bg-black/70"
              title="Enter Fullscreen"
            >
              {/* Expand/Fullscreen Icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Video Info - Hide in fullscreen */}
      {!isFullscreen && videoInfo && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-white text-2xl font-bold mb-2">
            {videoInfo.title}
          </h1>
          {videoInfo.duration && (
            <p className="text-gray-400 text-sm mb-4">
              Duration: {videoInfo.duration}
            </p>
          )}
          {videoInfo.description && (
            <p className="text-gray-300 text-sm">
              {videoInfo.description}
            </p>
          )}
        </div>
      )}

      {/* Debug Info (only in development) - Hide in fullscreen */}
      {!isFullscreen && process.env.NODE_ENV === 'development' && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <details className="bg-gray-900 p-4 rounded">
            <summary className="text-white cursor-pointer">Debug Info</summary>
            <pre className="text-gray-400 text-xs mt-2 overflow-auto">
              {JSON.stringify({
                course_id,
                video_id,
                isLive,
                videoUrl: videoUrl?.substring(0, 100) + '...',
                urlType: isIframeUrl(videoUrl) ? 'iframe' : isDirectVideo(videoUrl) ? 'video' : 'unknown',
                isFullscreen
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default PlayerPage;
