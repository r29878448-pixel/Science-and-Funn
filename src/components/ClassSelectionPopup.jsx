import React, { useState } from 'react';
import { updateUserClass } from '../services/authService';

const ClassSelectionPopup = ({ userId, onClassSelected }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  console.log('🎯🎯🎯 ClassSelectionPopup COMPONENT MOUNTED 🎯🎯🎯');
  console.log('  userId:', userId);

  const classes = [
    { value: '9th', label: 'Class 9', icon: '📚', color: 'from-blue-500 to-blue-600' },
    { value: '10th', label: 'Class 10', icon: '📖', color: 'from-green-500 to-green-600' },
    { value: '11th', label: 'Class 11', icon: '🎓', color: 'from-purple-500 to-purple-600' },
    { value: '12th', label: 'Class 12', icon: '🏆', color: 'from-orange-500 to-orange-600' }
  ];

  const handleSubmit = async () => {
    if (!selectedClass) {
      setError('Please select your class');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await updateUserClass(userId, selectedClass);
      if (result.success) {
        console.log('✅ Class selected and saved:', selectedClass);
        
        // Also save to localStorage as backup
        localStorage.setItem(`userClass_${userId}`, selectedClass);
        
        onClassSelected(selectedClass);
      } else {
        setError(result.error || 'Failed to save class');
        
        // If Firebase fails, save to localStorage temporarily
        localStorage.setItem(`userClass_${userId}`, selectedClass);
        console.warn('⚠️ Saved class to localStorage as fallback');
        
        // Still call onClassSelected to close popup
        setTimeout(() => {
          onClassSelected(selectedClass);
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Error saving class:', err);
      setError(err.message);
      
      // Save to localStorage as fallback
      localStorage.setItem(`userClass_${userId}`, selectedClass);
      
      // Still proceed after showing error briefly
      setTimeout(() => {
        onClassSelected(selectedClass);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  console.log('🎯 ClassSelectionPopup component rendered');
  console.log('  selectedClass:', selectedClass);
  console.log('  loading:', loading);
  console.log('  error:', error);
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        e.stopPropagation();
        console.log('🎯 Popup background clicked - preventing close');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          console.log('🎯 ESC key pressed - preventing close');
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-scaleIn" style={{ position: 'relative', zIndex: 100000 }}>
        {console.log('🎯 Rendering popup content box')}
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🎯</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Select Your Class
          </h2>
          <p className="text-gray-600">
            Choose your class to get personalized content and compete on the leaderboard
          </p>
          <p className="text-sm text-red-600 mt-2 font-medium">
            ⚠️ You must select a class to continue
          </p>
        </div>

        {/* Class Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {classes.map((cls) => (
            <button
              key={cls.value}
              onClick={() => setSelectedClass(cls.value)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                selectedClass === cls.value
                  ? 'border-transparent shadow-xl scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {/* Background gradient when selected */}
              {selectedClass === cls.value && (
                <div className={`absolute inset-0 bg-gradient-to-br ${cls.color} rounded-xl opacity-10`}></div>
              )}
              
              <div className="relative">
                <div className="text-4xl mb-2">{cls.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{cls.label}</h3>
                
                {/* Checkmark when selected */}
                {selectedClass === cls.value && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedClass}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Continue'
          )}
        </button>

        {/* Note */}
        <p className="text-center text-xs text-gray-500 mt-4">
          You can change your class later from your profile settings
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ClassSelectionPopup;
