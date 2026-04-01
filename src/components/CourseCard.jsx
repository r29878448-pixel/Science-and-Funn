import React from 'react';

// Exact replica of screenshot course cards
const CourseCard = ({ course, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail - Full width top */}
      <div className="w-full h-48 bg-gray-200 overflow-hidden">
        {course.course_thumbnail || course.thumbnail ? (
          <img 
            src={course.course_thumbnail || course.thumbnail}
            alt={course.course_name || course.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold">COURSE</div>';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold">
            COURSE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Course Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
          {course.course_name || course.name}
        </h3>

        {/* Price */}
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Free
        </p>

        {/* View Content Button - Black, Full Width */}
        <button className="w-full bg-black hover:bg-gray-900 text-white text-sm font-medium py-2.5 px-4 rounded transition-colors">
          View Content
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
