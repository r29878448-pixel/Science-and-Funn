import axios from 'axios';
import { buildVideoUrl, normalizeUrl, appendQueryParam } from '../utils/urlUtils';

// ============================================
// CENTRALIZED API CONFIGURATION
// API URL fetched from: https://apiserver-all.vercel.app/api/scienceandfun/api-url
// The returned base URL gets /api/scienceandfun appended automatically
// ============================================

const API_URL_SOURCE = 'https://apiserver-all.vercel.app/api/scienceandfun/api-url';
const API_PATH_SUFFIX = '/api/scienceandfun';

// API Base URL - loaded from remote endpoint
let BASE_URL = '';

// Cache
let apiUrlCache = null;
let apiUrlCacheTime = 0;
const API_URL_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const loadApiUrlFromRemote = async () => {
  try {
    // Return cached value if fresh
    if (apiUrlCache && Date.now() - apiUrlCacheTime < API_URL_CACHE_DURATION) {
      console.log('✅ API Base URL loaded from cache:', apiUrlCache);
      return apiUrlCache;
    }

    const res = await fetch(API_URL_SOURCE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json?.url) throw new Error('No url field in response');

    // Append /api/scienceandfun to the returned base URL
    const rawUrl = json.url.replace(/\/$/, ''); // strip trailing slash
    BASE_URL = rawUrl + API_PATH_SUFFIX;
    apiUrlCache = BASE_URL;
    apiUrlCacheTime = Date.now();
    console.log('✅ API Base URL loaded:', BASE_URL);
    return BASE_URL;
  } catch (error) {
    console.error('❌ Error loading API URL:', error);
    return apiUrlCache || '';
  }
};

// Initialize on module load (browser only)
if (typeof window !== 'undefined') {
  loadApiUrlFromRemote();
}

// Update BASE_URL in memory only (read-only remote source)
export const updateApiUrl = async (newUrl) => {
  if (!newUrl || typeof newUrl !== 'string') {
    throw new Error('Invalid API URL');
  }
  try {
    new URL(newUrl);
  } catch (e) {
    throw new Error('Invalid URL format');
  }
  BASE_URL = newUrl.trim();
  console.log('✅ API Base URL updated in memory:', BASE_URL);
};

// Get current BASE_URL
export const getCurrentApiUrl = async () => {
  if (BASE_URL) return BASE_URL;

  if (apiUrlCache && Date.now() - apiUrlCacheTime < API_URL_CACHE_DURATION) {
    BASE_URL = apiUrlCache;
    return BASE_URL;
  }

  BASE_URL = await loadApiUrlFromRemote();
  return BASE_URL;
};

// Validate that BASE_URL is configured
const validateBaseUrl = () => {
  if (!BASE_URL || BASE_URL.trim() === '') {
    throw new Error('Service temporarily unavailable. Please try again later.');
  }
};

const apiClient = axios.create({
  timeout: 10000, // Reduced to 10 seconds for faster failure
  headers: {
    'Content-Type': 'application/json',
  }
});

// Aggressive cache for API responses
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (increased from 5)

// Get from cache if available and not expired
const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Using cached data for:', key);
    return cached.data;
  }
  return null;
};

// Save to cache
const saveToCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Security: Validate that request URL matches configured BASE_URL
const validateRequestUrl = (url) => {
  validateBaseUrl();
  
  if (!url.startsWith(BASE_URL)) {
    throw new Error(`Security Error: Request URL does not match configured Base URL. Expected: ${BASE_URL}`);
  }
  
  return true;
};

// Centralized API fetch with security validation and caching
const secureFetch = async (url, useCache = true) => {
  // Validate BASE_URL is configured
  validateBaseUrl();
  
  // Validate request URL matches BASE_URL
  validateRequestUrl(url);
  
  // Check cache first
  if (useCache) {
    const cached = getFromCache(url);
    if (cached) return cached;
  }
  
  console.log('🔒 Secure API Request:', url);
  
  try {
    // Use Next.js proxy to avoid CORS
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    const response = await apiClient.get(proxyUrl);
    
    // Save to cache
    if (useCache) {
      saveToCache(url, response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ API Request Failed:', error.message);
    console.error('❌ Full error:', error.response?.data || error);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ URL was:', url);
    
    // Generic error - don't expose technical details to users
    throw new Error('Unable to load content. Please try again later.');
  }
};

// ============================================
// API ENDPOINTS - All data from BASE_URL only
// ============================================

// Get all batches/courses
export const getBatches = async () => {
  const url = `${BASE_URL}/batches`;
  return await secureFetch(url);
};

// Get content root for a batch
export const getContentRoot = async (batchId) => {
  const url = `${BASE_URL}/content?course_id=${batchId}`;
  return await secureFetch(url);
};

// Get folder content (recursive)
export const getFolderContent = async (batchId, folderId) => {
  const url = `${BASE_URL}/content?course_id=${batchId}&parent_id=${folderId}`;
  return await secureFetch(url);
};

// Get video details with streaming URL
export const getVideoDetails = async (videoId, batchId) => {
  const url = `${BASE_URL}/video-details?video_id=${videoId}&course_id=${batchId}`;
  return await secureFetch(url);
};

// Get live and upcoming classes
export const getLiveClasses = async (batchId) => {
  const url = `${BASE_URL}/live?course_id=${batchId}`;
  return await secureFetch(url);
};

// Get previous live classes
export const getPreviousLiveClasses = async (batchId) => {
  const url = `${BASE_URL}/previous-live?course_id=${batchId}`;
  return await secureFetch(url);
};

// Get PDF/attachment URL
export const getAttachmentUrl = async (attachmentId, batchId) => {
  const url = `${BASE_URL}/attachment?id=${attachmentId}&course_id=${batchId}`;
  return await secureFetch(url);
};

// Export URL utilities for use in components
export { buildVideoUrl, normalizeUrl, appendQueryParam };

// ============================================
// HELPER FUNCTIONS
// ============================================

// Fetch all content recursively for a batch
export const fetchAllBatchContent = async (batchId) => {
  validateBaseUrl();
  
  console.log(`📦 Fetching all content for batch ${batchId}...`);
  
  // Get content root
  const rootResponse = await getContentRoot(batchId);
  const rootFolder = rootResponse.data?.find(item => item.material_type === 'FOLDER');
  
  if (!rootFolder) {
    throw new Error('No root folder found for this batch');
  }
  
  // Recursively fetch all content
  const allContent = await fetchFolderRecursive(batchId, rootFolder.id);
  
  console.log(`✅ Fetched ${allContent.length} items for batch ${batchId}`);
  return allContent;
};

// Recursive folder fetching
const fetchFolderRecursive = async (batchId, folderId, accumulated = [], depth = 0) => {
  if (depth > 10) {
    console.warn('⚠️ Max recursion depth reached');
    return accumulated;
  }
  
  try {
    const response = await getFolderContent(batchId, folderId);
    const items = response.data || [];
    
    accumulated = [...accumulated, ...items];
    
    // Find subfolders and fetch in parallel
    const subfolders = items.filter(i => i.material_type === 'FOLDER');
    
    if (subfolders.length > 0) {
      const subResults = await Promise.all(
        subfolders.map(folder => 
          fetchFolderRecursive(batchId, folder.id, [], depth + 1)
            .catch(err => {
              console.error(`Error fetching subfolder ${folder.id}:`, err.message);
              return [];
            })
        )
      );
      
      subResults.forEach(result => {
        accumulated = [...accumulated, ...result];
      });
    }
    
    return accumulated;
  } catch (error) {
    console.error(`Error fetching folder ${folderId}:`, error.message);
    return accumulated;
  }
};
