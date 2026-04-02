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
  
  // PDF Modal states
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');
  
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
      
      console.log('🎥 Fetching video details for:', video.id);
      
      // Get video details from API
      const videoDetails = await getVideoDetails(video.id, batchId);
      console.log('✅ Video details response:', videoDetails);
      
      // Extract video URL and token from response
      const data = videoDetails.data || videoDetails;
      const videoUrl = data.video_url || 
                      data.url || 
                      data.stream_url ||
                      data.video_player_url ||
                      data.player_url;
      
      const token = data.video_player_token || 
                   data.token || 
                   data.video_token ||
                   data.access_token;
      
      if (!videoUrl) {
        console.error('❌ No video URL found in response:', data);
        setMessage('😔 Sorry! Video not available. Please try again later.');
        setLoadingVideo(null);
        return;
      }
      
      // Build final URL with token if available
      let finalUrl = videoUrl;
      if (token) {
        console.log('🔑 Adding token to video URL');
        finalUrl = buildVideoUrl(videoUrl, token);
      }
      
      console.log('✅ Opening video URL:', finalUrl);
      
      // Open video in new tab
      window.open(finalUrl, '_blank');
      
    } catch (error) {
      console.error('❌ Error loading video:', error);
      setMessage('😔 Sorry! Video not available. Please try again later.');
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

  const handlePdfClick = async (pdf) => {
    try {
      setLoadingVideo(pdf.id); // Reuse loading state
      setMessage(''); // Clear previous messages
      
      console.log('📄 Opening PDF - Full object:', JSON.stringify(pdf, null, 2));
      
      // Try all possible PDF link field names
      let pdfLink = pdf.file_link || 
                    pdf.pdf_link || 
                    pdf.download_link || 
                    pdf.attachment_link ||
                    pdf.url ||
                    pdf.link ||
                    pdf.file_url ||
                    pdf.pdf_url;
      
      console.log('📄 Found PDF link:', pdfLink);
      
      if (!pdfLink) {
        console.error('❌ No PDF link found. Available fields:', Object.keys(pdf));
        setMessage('😔 Sorry! PDF link not available in content.');
        setLoadingVideo(null);
        return;
      }

      console.log('📄 Original PDF link:', pdfLink);
      console.log('📄 Link starts with http?', pdfLink.startsWith('http'));

      // If link is encrypted (not starting with http), decrypt it first
      if (!pdfLink.startsWith('http')) {
        console.log('🔐 PDF link is encrypted, decrypting...');
        console.log('🔐 Encrypted link length:', pdfLink.length);
        
        try {
          // Call local Next.js API to decrypt
          const response = await fetch('/api/pdf-decrypt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              encrypted_link: pdfLink,
              pdf_id: pdf.id
            })
          });

          console.log('🔐 Decrypt response status:', response.status);
          const responseText = await response.text();
          console.log('🔐 Decrypt response text:', responseText);

          if (!response.ok) {
            console.error('❌ Decrypt API error response:', responseText);
            throw new Error(`Decryption failed: ${response.status}`);
          }

          const data = JSON.parse(responseText);
          console.log('✅ Decrypt response data:', data);
          
          if (!data.success || !data.decrypted_url) {
            throw new Error(data.message || 'No decrypted URL received');
          }

          pdfLink = data.decrypted_url;
          console.log('✅ PDF decrypted successfully:', pdfLink);
        } catch (decryptError) {
          console.error('❌ Decryption failed:', decryptError);
          console.error('❌ Decryption error stack:', decryptError.stack);
          throw new Error(`Decryption failed: ${decryptError.message}`);
        }
      } else {
        console.log('✅ PDF link already decrypted (starts with http)');
      }

      // Validate final URL
      if (!pdfLink.startsWith('http')) {
        throw new Error('Invalid PDF URL after decryption');
      }

      // Open PDF in modal with ClassX viewer
      const viewerUrl = `https://pdfweb.classx.co.in/pdfjs/web/viewer-new.html?file=${encodeURIComponent(pdfLink)}`;
      
      console.log('📄 Final viewer URL:', viewerUrl);
      console.log('📄 Opening PDF in modal...');
      
      // Set PDF modal state
      setCurrentPdfUrl(viewerUrl);
      setCurrentPdfTitle(pdf.Title || pdf.title || 'E-Book');
      setPdfModalOpen(true);
      setLoadingVideo(null);
      
      console.log('✅ PDF modal opened successfully');
      
    } catch (error) {
      console.error('❌ Error opening PDF:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      setMessage(`😔 Sorry! Unable to open PDF. ${error.message}`);
      setLoadingVideo(null);
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
      
      console.log('🔴 Fetching live video details for:', videoId);
      
      // Get video details from API
      const videoDetails = await getVideoDetails(videoId, batchId);
      console.log('✅ Live video details response:', videoDetails);
      
      // Extract video URL and token
      const data = videoDetails.data || videoDetails;
      const videoUrl = data.video_url || 
                      data.url || 
                      data.stream_url ||
                      data.video_player_url ||
                      data.player_url;
      
      const token = data.video_player_token || 
                   data.token || 
                   data.video_token ||
                   data.access_token;
      
      if (!videoUrl) {
        console.error('❌ No video URL found in response:', data);
        setMessage('😔 Sorry! Video not available. Please try again later.');
        setLoadingVideo(null);
        return;
      }
      
      // Build final URL with token if available
      let finalUrl = videoUrl;
      if (token) {
        console.log('🔑 Adding token to live video URL');
        finalUrl = buildVideoUrl(videoUrl, token);
      }
      
      console.log('✅ Opening live video URL:', finalUrl);
      
      // Open video in new tab
      window.open(finalUrl, '_blank');
      
    } catch (error) {
      console.error('❌ Error loading live video:', error);
      setMessage('😔 Sorry! Video not available. Please try again later.');
    } finally {
      setLoadingVideo(null);
    }
  };

  // Handle previous live watch
  const handlePreviousLiveWatch = async (previousClass) => {
    try {
      setLoadingVideo(previousClass.id);
      
      console.log('📹 Fetching previous live video details for:', previousClass.id);
      
      // Get video details from API
      const videoDetails = await getVideoDetails(previousClass.id, batchId);
      console.log('✅ Previous live video details response:', videoDetails);
      
      // Extract video URL and token
      const data = videoDetails.data || videoDetails;
      const videoUrl = data.video_url || 
                      data.url || 
                      data.stream_url ||
                      data.video_player_url ||
                      data.player_url;
      
      const token = data.video_player_token || 
                   data.token || 
                   data.video_token ||
                   data.access_token;
      
      if (!videoUrl) {
        console.error('❌ No video URL found in response:', data);
        setMessage('😔 Sorry! Video not available. Please try again later.');
        setLoadingVideo(null);
        return;
      }
      
      // Build final URL with token if available
      let finalUrl = videoUrl;
      if (token) {
        console.log('🔑 Adding token to previous live video URL');
        finalUrl = buildVideoUrl(videoUrl, token);
      }
      
      console.log('✅ Opening previous live video URL:', finalUrl);
      
      // Open video in new tab
      window.open(finalUrl, '_blank');
      
    } catch (error) {
      console.error('❌ Error loading video:', error);
      setMessage('😔 Sorry! Video not available. Please try again later.');
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
      {/* PDF Modal */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full h-full max-w-7xl mx-auto p-2 sm:p-4">
            {/* Modal Header */}
            <div className="bg-white rounded-t-lg px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {currentPdfTitle}
              </h3>
              <button
                onClick={() => {
                  setPdfModalOpen(false);
                  setCurrentPdfUrl('');
                  setCurrentPdfTitle('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            
            {/* PDF Viewer */}
            <div className="bg-white rounded-b-lg overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
              <iframe
                src={currentPdfUrl}
                className="w-full h-full border-0"
                title={currentPdfTitle}
              />
            </div>
          </div>
        </div>
      )}

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
                      onPdfClick={handlePdfClick}
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
