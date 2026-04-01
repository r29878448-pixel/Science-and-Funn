import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  getCurrentApiUrl, 
  getBatches,
  fetchAllBatchContent,
  getVideoDetails,
  buildVideoUrl,
  getLiveClasses,
  getPreviousLiveClasses
} from '../../src/services/apiService';
import FolderCard from '../../src/components/FolderCard';
import VideoCard from '../../src/components/VideoCard';
import PdfCard from '../../src/components/PdfCard';
import { LiveClassCard, UpcomingClassCard, PreviousLiveCard } from '../../src/components/LiveClassCard';

const BatchDetailPage = () => {
  const router = useRouter();
  const { batchId } = router.query;
  
  const [batch, setBatch] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loadingVideo, setLoadingVideo] = useState(null);
  
  // Live & Upcoming states
  const [liveSubTab, setLiveSubTab] = useState('live'); // 'live' or 'previous'
  const [liveClasses, setLiveClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [previousLiveClasses, setPreviousLiveClasses] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);

  useEffect(() => {
    if (batchId) {
      loadBatchData();
    }
  }, [batchId]);

  const loadBatchData = async () => {
    try {
      setLoading(true);
      
      // Load API URL from Firebase
      const apiUrl = await getCurrentApiUrl();
      if (!apiUrl) {
        setMessage('😔 Sorry! Server is temporarily down. Please try again later.');
        setLoading(false);
        return;
      }

      // Get batch info
      const batchesResponse = await getBatches();
      const batches = batchesResponse.data || batchesResponse || [];
      const foundBatch = batches.find(b => String(b.id) === String(batchId));
      
      if (!foundBatch) {
        setMessage('❌ Batch not found');
        setLoading(false);
        return;
      }
      
      setBatch(foundBatch);
      
      // Load content
      console.log('🔄 Loading content for batch:', batchId);
      const batchContent = await fetchAllBatchContent(batchId);
      console.log('✅ Loaded content:', batchContent);
      console.log('📊 Content length:', batchContent.length);
      console.log('📁 Content items:', batchContent.map(item => ({
        id: item.id,
        title: item.Title || item.title,
        type: item.material_type,
        parent_id: item.parent_id
      })));
      
      setContent(batchContent);
      
    } catch (error) {
      console.error('❌ Error loading batch:', error);
      setMessage('😔 Sorry! Server is temporarily down. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = async (video) => {
    try {
      setLoadingVideo(video.id);
      
      // Get video details from API
      const videoDetails = await getVideoDetails(video.id, batchId);
      console.log('🎥 Video details:', videoDetails);
      
      // Extract video URL
      const videoUrl = videoDetails.video_url || 
                      videoDetails.url || 
                      videoDetails.stream_url ||
                      videoDetails.data?.video_url ||
                      videoDetails.data?.url;
      
      if (videoUrl) {
        console.log('✅ Opening video in new tab:', videoUrl);
        // Open video URL directly in new tab
        window.open(videoUrl, '_blank');
      } else {
        console.error('❌ No video URL found in response');
        setMessage('😔 Sorry! Video not available. Please try again later.');
      }
    } catch (error) {
      console.error('❌ Error loading video:', error);
      setMessage('❌ Failed to load video');
    } finally {
      setLoadingVideo(null);
    }
  };

  const handleFolderClick = (folder) => {
    console.log('📂 Opening folder:', folder);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, title: folder.Title || folder.title }]);
    setCurrentFolder(folder.id);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setBreadcrumbs([]);
      setCurrentFolder(null);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    }
  };

  const handlePdfClick = (pdf) => {
    const pdfUrl = pdf.file_link || pdf.pdf_link || pdf.download_link;
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      setMessage('❌ PDF link not available');
    }
  };

  // Load live and upcoming classes (lazy load when tab is clicked)
  const loadLiveClasses = async () => {
    if (liveClasses.length > 0 || upcomingClasses.length > 0) {
      return; // Already loaded
    }

    try {
      setLoadingLive(true);
      console.log('🔴 Loading live classes for batch:', batchId);
      
      const response = await getLiveClasses(batchId);
      console.log('✅ Live classes response:', response);
      
      const live = response.live || response.data?.live || [];
      const upcoming = response.upcoming || response.data?.upcoming || [];
      
      setLiveClasses(live);
      setUpcomingClasses(upcoming);
      
      console.log(`📊 Live: ${live.length}, Upcoming: ${upcoming.length}`);
    } catch (error) {
      console.error('❌ Error loading live classes:', error);
      setMessage('😔 Sorry! Unable to load live classes. Please try again later.');
    } finally {
      setLoadingLive(false);
    }
  };

  // Load previous live classes
  const loadPreviousLiveClasses = async () => {
    if (previousLiveClasses.length > 0) {
      return; // Already loaded
    }

    try {
      setLoadingLive(true);
      console.log('📹 Loading previous live classes for batch:', batchId);
      
      const response = await getPreviousLiveClasses(batchId);
      console.log('✅ Previous live response:', response);
      
      const previous = response.data || response || [];
      setPreviousLiveClasses(previous);
      
      console.log(`📊 Previous live: ${previous.length}`);
    } catch (error) {
      console.error('❌ Error loading previous live:', error);
      setMessage('😔 Sorry! Unable to load previous classes. Please try again later.');
    } finally {
      setLoadingLive(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'live') {
      loadLiveClasses();
    }
  };

  // Handle live sub-tab change
  const handleLiveSubTabChange = (subTab) => {
    setLiveSubTab(subTab);
    if (subTab === 'previous') {
      loadPreviousLiveClasses();
    }
  };

  // Handle live class watch
  const handleLiveWatch = async (liveClass) => {
    try {
      setLoadingVideo(liveClass.id);
      
      const videoId = liveClass.id || liveClass.video_id;
      
      // Get video details from API
      const videoDetails = await getVideoDetails(videoId, batchId);
      console.log('🔴 Live video details:', videoDetails);
      
      // Extract video URL
      const videoUrl = videoDetails.video_url || 
                      videoDetails.url || 
                      videoDetails.stream_url ||
                      videoDetails.data?.video_url ||
                      videoDetails.data?.url;
      
      if (videoUrl) {
        console.log('✅ Opening live video in new tab:', videoUrl);
        // Open video URL directly in new tab
        window.open(videoUrl, '_blank');
      } else {
        console.error('❌ No video URL found');
        setMessage('❌ Video URL not available');
      }
    } catch (error) {
      console.error('❌ Error loading live video:', error);
      setMessage('❌ Failed to load video');
    } finally {
      setLoadingVideo(null);
    }
  };

  // Handle previous live watch
  const handlePreviousLiveWatch = async (previousClass) => {
    try {
      setLoadingVideo(previousClass.id);
      
      // Get video details from API
      const videoDetails = await getVideoDetails(previousClass.id, batchId);
      console.log('📹 Previous live video details:', videoDetails);
      
      // Extract video URL
      const videoUrl = videoDetails.video_url || 
                      videoDetails.url || 
                      videoDetails.stream_url ||
                      videoDetails.data?.video_url ||
                      videoDetails.data?.url;
      
      if (videoUrl) {
        console.log('✅ Opening previous live video in new tab:', videoUrl);
        // Open video URL directly in new tab
        window.open(videoUrl, '_blank');
      } else {
        console.error('❌ No video URL found');
        setMessage('❌ Video URL not available');
      }
    } catch (error) {
      console.error('❌ Error loading video:', error);
      setMessage('❌ Failed to load video');
    } finally {
      setLoadingVideo(null);
    }
  };

  // Get current content based on folder
  const getCurrentContent = () => {
    if (!content || content.length === 0) {
      console.log('⚠️ No content available');
      return [];
    }

    if (!currentFolder) {
      // Root level - show items that don't have a parent in the content list
      const rootItems = content.filter(item => {
        const hasParentInList = content.some(p => 
          p.material_type === 'FOLDER' && String(p.id) === String(item.parent_id)
        );
        return !hasParentInList;
      });
      console.log('📂 Root items:', rootItems.length);
      return rootItems;
    }
    
    // Inside folder - show items with matching parent_id
    const folderItems = content.filter(item => 
      String(item.parent_id) === String(currentFolder)
    );
    console.log(`📂 Folder ${currentFolder} items:`, folderItems.length);
    return folderItems;
  };

  const currentContent = getCurrentContent();
  const folders = currentContent.filter(item => item.material_type === 'FOLDER');
  const videos = currentContent.filter(item => item.material_type === 'VIDEO');
  const pdfs = currentContent.filter(item => item.material_type === 'PDF');

  console.log('📊 Current view:', {
    currentFolder,
    totalContent: content.length,
    currentContent: currentContent.length,
    folders: folders.length,
    videos: videos.length,
    pdfs: pdfs.length
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-8 bg-gray-300 rounded w-64 mb-4 animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="h-10 w-24 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {batch?.course_name || batch?.name || 'Course Content'}
          </h1>
          
          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleTabChange('content')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                activeTab === 'content'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => handleTabChange('live')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                activeTab === 'live'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Live & Upcoming
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'content' && (
          <>
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="mb-6 flex items-center text-sm text-gray-600">
                <button 
                  onClick={() => handleBreadcrumbClick(-1)} 
                  className="hover:text-black font-medium"
                >
                  Home
                </button>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.id}>
                    <span className="mx-2 text-gray-400">&gt;</span>
                    <button 
                      onClick={() => handleBreadcrumbClick(index)}
                      className="hover:text-black font-medium"
                    >
                      {crumb.title}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Message */}
            {message && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-yellow-800">{message}</p>
              </div>
            )}

            {/* Folders Grid */}
            {folders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Folders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map(folder => (
                    <FolderCard 
                      key={folder.id}
                      folder={folder}
                      onClick={() => handleFolderClick(folder)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Videos Grid */}
            {videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {videos.map(video => (
                    <VideoCard 
                      key={video.id}
                      video={video}
                      onWatch={handleVideoClick}
                      loading={loadingVideo === video.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* PDFs Grid */}
            {pdfs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">E-Books</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pdfs.map(pdf => (
                    <PdfCard 
                      key={pdf.id}
                      pdf={pdf}
                      onClick={() => handlePdfClick(pdf)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Content Message */}
            {folders.length === 0 && videos.length === 0 && pdfs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg mb-2">No content available</p>
                <p className="text-gray-400 text-sm">
                  {content.length === 0 
                    ? 'This batch has no content yet' 
                    : 'This folder is empty'}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'live' && (
          <>
            {/* Live Sub-Tabs */}
            <div className="mb-6 flex space-x-2">
              <button
                onClick={() => handleLiveSubTabChange('live')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  liveSubTab === 'live'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Live & Upcoming
              </button>
              <button
                onClick={() => handleLiveSubTabChange('previous')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  liveSubTab === 'previous'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Previous Live Videos
              </button>
            </div>

            {loadingLive ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
                <p className="text-gray-700">Loading...</p>
              </div>
            ) : (
              <>
                {liveSubTab === 'live' && (
                  <>
                    {/* Live Classes */}
                    {liveClasses.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <span className="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                          Live Now
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {liveClasses.map(liveClass => (
                            <LiveClassCard 
                              key={liveClass.id}
                              liveClass={liveClass}
                              onWatch={handleLiveWatch}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming Classes */}
                    {upcomingClasses.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {upcomingClasses.map(upcomingClass => (
                            <UpcomingClassCard 
                              key={upcomingClass.id}
                              upcomingClass={upcomingClass}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Live/Upcoming */}
                    {liveClasses.length === 0 && upcomingClasses.length === 0 && (
                      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <div className="text-6xl mb-4">📅</div>
                        <p className="text-gray-500 text-lg">No live or upcoming classes</p>
                      </div>
                    )}
                  </>
                )}

                {liveSubTab === 'previous' && (
                  <>
                    {/* Previous Live Classes */}
                    {previousLiveClasses.length > 0 ? (
                      <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Live Videos</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {previousLiveClasses.map(previousClass => (
                            <PreviousLiveCard 
                              key={previousClass.id}
                              previousClass={previousClass}
                              onWatch={handlePreviousLiveWatch}
                              loading={loadingVideo === previousClass.id}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <div className="text-6xl mb-4">📹</div>
                        <p className="text-gray-500 text-lg">No previous live videos</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BatchDetailPage;
