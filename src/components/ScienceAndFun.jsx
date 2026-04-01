import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentApiUrl, getBatches } from '../services/apiService';
import CourseCard from './CourseCard';
import { CourseGridSkeleton } from './LoadingSkeleton';

const ScienceAndFun = () => {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    
    try {
      // Load API URL from Firebase
      const apiUrl = await getCurrentApiUrl();
      
      if (!apiUrl) {
        setMessage('😔 Sorry! Server is temporarily down. Please try again later.');
        setLoading(false);
        return;
      }
      
      const response = await getBatches();
      const apiBatches = response.data || response || [];
      
      setBatches(apiBatches);
      
      if (apiBatches.length === 0) {
        setMessage('📚 No courses available at the moment. Please check back later.');
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      // User-friendly error message with apology
      setMessage('😔 Sorry! Server is temporarily down. Please try again later.');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (batchId) => {
    router.push(`/batch/${batchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="h-9 bg-gray-300 rounded w-48 animate-pulse"></div>
          </div>
          
          {/* Fast Loading Skeleton */}
          <CourseGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (!getCurrentApiUrl()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Sad emoji animation */}
            <div className="text-8xl mb-6 animate-bounce">😔</div>
            
            {/* Error message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sorry for the Inconvenience!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Server is temporarily down. Please try again later.
            </p>
            
            {/* Retry button */}
            <button
              onClick={loadBatches}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔄 Try Again
            </button>
            
            {/* Additional info */}
            <p className="text-sm text-gray-500 mt-6">
              If the problem persists, please contact support
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
        </div>

        {/* Message - Show error beautifully */}
        {message && batches.length === 0 && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md w-full">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Sad emoji animation */}
                <div className="text-8xl mb-6 animate-bounce">😔</div>
                
                {/* Error message */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sorry for the Inconvenience!
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {message}
                </p>
                
                {/* Retry button */}
                <button
                  onClick={loadBatches}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🔄 Try Again
                </button>
                
                {/* Additional info */}
                <p className="text-sm text-gray-500 mt-6">
                  If the problem persists, please contact support
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Courses Grid - 3-4 per row */}
        {batches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {batches.map((batch) => (
              <CourseCard 
                key={batch.id}
                course={batch}
                onClick={() => handleCourseClick(batch.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">No courses available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScienceAndFun;
