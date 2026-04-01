import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentApiUrl, getBatches } from '../services/apiService';
import CourseCard from './CourseCard';

const ScienceAndFun = () => {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    const apiUrl = getCurrentApiUrl();
    
    if (!apiUrl) {
      setMessage('⚠️ API not configured. Please contact support.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await getBatches();
      const apiBatches = response.data || response || [];
      
      setBatches(apiBatches);
      
      if (apiBatches.length === 0) {
        setMessage('📚 No courses available at the moment. Please check back later.');
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      // Generic error message - don't expose technical details
      setMessage('⚠️ Unable to load courses. Please try again later or contact support.');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (!getCurrentApiUrl()) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Service Unavailable</h2>
            <p className="text-yellow-700 mb-4">
              We're experiencing technical difficulties. Please try again later or contact support.
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

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-yellow-800">{message}</p>
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
