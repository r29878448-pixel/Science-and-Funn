import React from 'react';

// Exact replica of screenshot folder cards
const FolderCard = ({ folder, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        {/* Purple Folder Icon */}
        <div className="flex-shrink-0">
          <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        </div>

        {/* Folder Title */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {folder.Title || folder.title || folder.name}
          </h3>
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FolderCard;
