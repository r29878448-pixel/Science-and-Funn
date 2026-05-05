import React, { useState, useEffect } from 'react';

const TelegramPopup = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  console.log('📱📱📱 TelegramPopup COMPONENT MOUNTED 📱📱📱');

  useEffect(() => {
    // Animate in after mount
    console.log('📱 TelegramPopup mounted, animating in...');
    setTimeout(() => {
      setIsVisible(true);
      console.log('📱 TelegramPopup visible state set to true');
    }, 100);
  }, []);

  const handleJoinTelegram = () => {
    console.log('📱 User clicked Join Telegram');
    window.open('https://t.me/Study_Portalz', '_blank');
    handleClose();
  };

  const handleClose = () => {
    console.log('📱 Closing Telegram popup');
    setIsVisible(false);
    sessionStorage.setItem('telegramPopupShown', 'true');
    setTimeout(() => onClose(), 300);
  };

  console.log('📱 Rendering TelegramPopup, isVisible:', isVisible);
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99998,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s'
      }}
      onClick={handleClose}
    >
      <div 
        className={`bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl max-w-md w-full p-1 transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-90'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-xl p-8 relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Telegram Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-4 animate-bounce">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Join Our Telegram Channel 🚀
            </h2>
          </div>

          {/* Message */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-center leading-relaxed">
              <span className="font-semibold">Website kabhi bhi down ho sakti hai!</span>
              <br />
              Latest updates, free batches aur important notifications ke liye 
              <span className="font-semibold text-blue-600"> Telegram join karo</span>.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-3 text-sm text-gray-700">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Instant updates when website is down</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-700">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Free batches and courses notifications</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-700">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Important announcements and tips</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleJoinTelegram}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              <span>Join Telegram Channel</span>
            </button>

            <button
              onClick={handleClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Already Joined
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-500 mt-4">
            This popup will show once per session
          </p>
        </div>
      </div>
    </div>
  );
};

export default TelegramPopup;
