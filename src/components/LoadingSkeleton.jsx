import React from 'react';

// Card Skeleton for Course Listing
export const CourseCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="h-52 bg-gradient-to-br from-gray-300 to-gray-400"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-300 rounded mb-3 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
      <div className="h-12 bg-gray-300 rounded"></div>
    </div>
  </div>
);

// Content Card Skeleton for Batch Detail
export const ContentCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="flex">
      <div className="w-48 h-32 bg-gradient-to-br from-gray-300 to-gray-400 flex-shrink-0"></div>
      <div className="flex-1 p-4">
        <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

// Folder Skeleton
export const FolderSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border-l-4 border-gray-300">
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-300 rounded mb-2 w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="w-20 h-8 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

// Grid of Course Skeletons
export const CourseGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, idx) => (
      <CourseCardSkeleton key={idx} />
    ))}
  </div>
);

// List of Content Skeletons
export const ContentListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, idx) => (
      <ContentCardSkeleton key={idx} />
    ))}
  </div>
);

export default {
  CourseCardSkeleton,
  ContentCardSkeleton,
  FolderSkeleton,
  CourseGridSkeleton,
  ContentListSkeleton
};
