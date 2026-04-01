// ============================================
// URL UTILITY FUNCTIONS
// Prevent duplicate query parameters
// ============================================

/**
 * Safely append query parameter to URL
 * Prevents duplicate parameters (especially token)
 * @param {string} url - Base URL
 * @param {string} paramName - Parameter name (e.g., 'token')
 * @param {string} paramValue - Parameter value
 * @returns {string} - Clean URL with parameter
 */
export const appendQueryParam = (url, paramName, paramValue) => {
  if (!url || !paramName || !paramValue) return url;
  
  try {
    const urlObj = new URL(url);
    
    // Check if parameter already exists
    if (urlObj.searchParams.has(paramName)) {
      // Update existing parameter
      urlObj.searchParams.set(paramName, paramValue);
      console.log(`✅ Updated existing param: ${paramName}`);
    } else {
      // Add new parameter
      urlObj.searchParams.append(paramName, paramValue);
      console.log(`✅ Added new param: ${paramName}`);
    }
    
    return urlObj.toString();
  } catch (error) {
    // Fallback for invalid URLs
    console.warn('Invalid URL, using fallback:', url);
    const separator = url.includes('?') ? '&' : '?';
    
    // Check if param already exists in string
    const regex = new RegExp(`[?&]${paramName}=`, 'i');
    if (regex.test(url)) {
      // Replace existing param
      const newUrl = url.replace(
        new RegExp(`([?&])${paramName}=[^&]*`, 'i'), 
        `$1${paramName}=${paramValue}`
      );
      console.log(`✅ Replaced param in string: ${paramName}`);
      return newUrl;
    }
    
    return `${url}${separator}${paramName}=${paramValue}`;
  }
};

/**
 * Build video player URL with token
 * Ensures token is added only once
 * @param {string} playerUrl - Base player URL
 * @param {string} token - Video token
 * @returns {string} - Clean player URL
 */
export const buildVideoUrl = (playerUrl, token) => {
  if (!playerUrl) {
    console.warn('⚠️ No player URL provided');
    return null;
  }
  
  if (!token) {
    console.warn('⚠️ No token provided, returning URL as-is');
    return playerUrl;
  }
  
  console.log('🔧 Building video URL...');
  console.log('  Input URL:', playerUrl);
  console.log('  Token:', token.substring(0, 20) + '...');
  
  // Remove any trailing &token= or ?token= without value
  let cleanUrl = playerUrl.replace(/[?&]token=(&|$)/g, '$1');
  cleanUrl = cleanUrl.replace(/[?&]$/, ''); // Remove trailing ? or &
  
  console.log('  Cleaned URL:', cleanUrl);
  
  // Append token safely
  const finalUrl = appendQueryParam(cleanUrl, 'token', token);
  
  console.log('  Final URL:', finalUrl);
  console.log('✅ Video URL built successfully');
  
  return finalUrl;
};

/**
 * Normalize URL - remove duplicate params
 * @param {string} url - URL to normalize
 * @returns {string} - Normalized URL
 */
export const normalizeUrl = (url) => {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    const params = new Map();
    
    // Collect unique params (last value wins)
    urlObj.searchParams.forEach((value, key) => {
      if (value) { // Only keep params with values
        params.set(key, value);
      }
    });
    
    // Rebuild URL with unique params
    urlObj.search = '';
    params.forEach((value, key) => {
      urlObj.searchParams.append(key, value);
    });
    
    const normalized = urlObj.toString();
    console.log('✅ URL normalized:', normalized);
    return normalized;
  } catch (error) {
    console.warn('⚠️ Could not normalize URL:', url);
    return url;
  }
};

/**
 * Check if URL has duplicate parameters
 * @param {string} url - URL to check
 * @returns {boolean} - True if duplicates found
 */
export const hasDuplicateParams = (url) => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const paramCounts = new Map();
    
    urlObj.searchParams.forEach((value, key) => {
      paramCounts.set(key, (paramCounts.get(key) || 0) + 1);
    });
    
    for (const [key, count] of paramCounts) {
      if (count > 1) {
        console.warn(`⚠️ Duplicate parameter found: ${key} (${count} times)`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Extract query parameter from URL
 * @param {string} url - URL to extract from
 * @param {string} paramName - Parameter name
 * @returns {string|null} - Parameter value or null
 */
export const getQueryParam = (url, paramName) => {
  if (!url || !paramName) return null;
  
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(paramName);
  } catch (error) {
    // Fallback regex
    const regex = new RegExp(`[?&]${paramName}=([^&]*)`);
    const match = url.match(regex);
    return match ? match[1] : null;
  }
};

/**
 * Remove query parameter from URL
 * @param {string} url - URL to modify
 * @param {string} paramName - Parameter name to remove
 * @returns {string} - URL without parameter
 */
export const removeQueryParam = (url, paramName) => {
  if (!url || !paramName) return url;
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete(paramName);
    return urlObj.toString();
  } catch (error) {
    // Fallback regex
    return url.replace(new RegExp(`[?&]${paramName}=[^&]*&?`), '');
  }
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Build clean URL with multiple parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Object with key-value pairs
 * @returns {string} - URL with all parameters
 */
export const buildUrlWithParams = (baseUrl, params = {}) => {
  if (!baseUrl) return baseUrl;
  
  let url = baseUrl;
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url = appendQueryParam(url, key, value);
    }
  });
  
  return url;
};

export default {
  appendQueryParam,
  buildVideoUrl,
  normalizeUrl,
  hasDuplicateParams,
  getQueryParam,
  removeQueryParam,
  isValidUrl,
  buildUrlWithParams
};
