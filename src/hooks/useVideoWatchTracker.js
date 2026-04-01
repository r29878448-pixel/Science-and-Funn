import { useState, useEffect, useRef } from 'react';
import { addXP, WATCH_INTERVAL_SECONDS } from '../services/xpService';

/**
 * Hook to track video watch time and award XP
 * Awards 1 XP for every 3 minutes (180 seconds) of active watching
 */
export const useVideoWatchTracker = (userId, videoId, courseId) => {
  const [watchTime, setWatchTime] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  
  const intervalRef = useRef(null);
  const lastXpAwardRef = useRef(0);

  // Start tracking
  const startTracking = () => {
    if (!userId) {
      console.warn('⚠️ Cannot track: User not logged in');
      return;
    }

    // Check if page is visible
    if (document.hidden) {
      console.log('⏸️ Page hidden, not starting tracker');
      return;
    }

    setIsTracking(true);
    console.log('▶️ Started watch tracking');
  };

  // Stop tracking
  const stopTracking = () => {
    setIsTracking(false);
    console.log('⏸️ Stopped watch tracking');
  };

  // Reset tracking
  const resetTracking = () => {
    setWatchTime(0);
    setXpEarned(0);
    lastXpAwardRef.current = 0;
    console.log('🔄 Reset watch tracking');
  };

  // Track watch time
  useEffect(() => {
    if (!isTracking || !userId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Increment watch time every second
    intervalRef.current = setInterval(() => {
      setWatchTime((prev) => {
        const newTime = prev + 1;

        // Check if we've reached the XP interval
        const xpIntervals = Math.floor(newTime / WATCH_INTERVAL_SECONDS);
        const lastXpIntervals = Math.floor(lastXpAwardRef.current / WATCH_INTERVAL_SECONDS);

        if (xpIntervals > lastXpIntervals) {
          // Award XP
          const xpToAward = xpIntervals - lastXpIntervals;
          console.log(`🎉 Awarding ${xpToAward} XP for ${WATCH_INTERVAL_SECONDS}s watch time`);
          
          addXP(userId, xpToAward).then((result) => {
            if (result.success) {
              setXpEarned((prev) => prev + xpToAward);
              console.log(`✅ XP awarded successfully`);
            } else {
              console.error('❌ Failed to award XP:', result.error);
            }
          });

          lastXpAwardRef.current = newTime;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTracking, userId]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Page hidden, stopping tracker');
        stopTracking();
      } else {
        console.log('👁️ Page visible');
        // Don't auto-start, let video play event handle it
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    watchTime,
    xpEarned,
    isTracking,
    startTracking,
    stopTracking,
    resetTracking,
    progress: (watchTime % WATCH_INTERVAL_SECONDS) / WATCH_INTERVAL_SECONDS * 100,
    nextXpIn: WATCH_INTERVAL_SECONDS - (watchTime % WATCH_INTERVAL_SECONDS)
  };
};
