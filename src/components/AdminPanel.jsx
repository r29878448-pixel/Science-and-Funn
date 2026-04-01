import React, { useState, useEffect } from 'react';
import { 
  updateApiUrl, 
  getCurrentApiUrl, 
  getBatches, 
  fetchAllBatchContent,
  getVideoDetails 
} from '../services/apiService';

const AdminPanel = ({ onClose }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  
  // API Test Results
  const [testResults, setTestResults] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchContent, setBatchContent] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});

  useEffect(() => {
    loadCurrentApiUrl();
  }, []);

  const loadCurrentApiUrl = () => {
    try {
      const url = getCurrentApiUrl();
      setCurrentUrl(url);
      setApiUrl(url);
      
      if (!url) {
        setMessage('⚠️ Please configure API Base URL to continue');
      }
    } catch (error) {
      console.error('Error loading API URL:', error);
      setMessage('Error loading API URL');
    } finally {
      setLoading(false);
    }
  };

  const saveApiUrl = async () => {
    if (!apiUrl.trim()) {
      setMessage('❌ Please enter a valid API URL');
      return;
    }

    // Validate URL format
    try {
      new URL(apiUrl.trim());
    } catch (e) {
      setMessage('❌ Invalid URL format');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      updateApiUrl(apiUrl.trim());
      setCurrentUrl(apiUrl.trim());
      
      setMessage('✅ API Base URL updated successfully!');
      
      // Clear test results and batches
      setTestResults(null);
      setBatches([]);
      setSelectedBatch(null);
      setBatchContent(null);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving API URL:', error);
      setMessage('❌ ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const resetApiUrl = () => {
    setApiUrl('');
    setCurrentUrl('');
    localStorage.removeItem('apiBaseUrl');
    setTestResults(null);
    setBatches([]);
    setSelectedBatch(null);
    setBatchContent(null);
    setMessage('🔄 API URL cleared');
    setTimeout(() => setMessage(''), 2000);
  };

  const testApiConnection = async () => {
    if (!currentUrl) {
      setMessage('❌ Please save API URL first');
      return;
    }

    setTesting(true);
    setMessage('🔄 Testing API connection...');
    setTestResults(null);

    const results = {
      baseUrl: currentUrl,
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Fetch batches
      const startTime = Date.now();
      const batchesResponse = await getBatches();
      const batchesTime = Date.now() - startTime;
      
      const batchesList = batchesResponse.data || batchesResponse || [];
      
      results.tests.push({
        name: 'Fetch Batches',
        status: '✅ Success',
        time: `${batchesTime}ms`,
        data: `Found ${batchesList.length} batches`
      });

      setBatches(batchesList);
      
      setTestResults(results);
      setMessage(`✅ API connection successful! Found ${batchesList.length} batches`);
      
    } catch (error) {
      results.tests.push({
        name: 'Fetch Batches',
        status: '❌ Failed',
        error: error.message
      });
      
      setTestResults(results);
      setMessage('❌ API test failed: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const loadBatchContent = async (batch) => {
    setSelectedBatch(batch);
    setMessage(`🔄 Loading content for ${batch.course_name || batch.name}...`);
    
    try {
      const content = await fetchAllBatchContent(batch.id);
      setBatchContent(content);
      setMessage(`✅ Loaded ${content.length} items`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error loading batch content:', error);
      setMessage('❌ Failed to load content: ' + error.message);
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const renderContentItem = (item, depth = 0) => {
    const isFolder = item.material_type === 'FOLDER';
    const paddingLeft = depth * 20;
    
    if (isFolder) {
      const children = batchContent?.filter(i => String(i.parent_id) === String(item.id)) || [];
      const isExpanded = expandedFolders[item.id];
      
      return (
        <div key={item.id} style={{ marginLeft: `${paddingLeft}px` }} className="mb-1">
          <div 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer border-l-2 border-blue-300"
            onClick={() => toggleFolder(item.id)}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{isExpanded ? '📂' : '📁'}</span>
              <div>
                <p className="font-medium text-sm">{item.Title || item.title || item.name}</p>
                <p className="text-xs text-gray-500">{children.length} items</p>
              </div>
            </div>
          </div>
          
          {isExpanded && children.length > 0 && (
            <div className="mt-1">
              {children.map(child => renderContentItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div 
          key={item.id}
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
          style={{ marginLeft: `${paddingLeft}px` }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {item.material_type === 'VIDEO' ? '🎥' : 
               item.material_type === 'PDF' ? '📄' : 
               item.material_type === 'QUIZ' ? '📝' : '📎'}
            </span>
            <div>
              <p className="font-medium text-sm">{item.Title || item.title || item.name}</p>
              <p className="text-xs text-gray-500">{item.material_type}</p>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔧 Admin Panel
          </h1>
          <p className="text-lg text-gray-600">
            API-Driven Architecture - No Firebase, No Static Data
          </p>
        </div>

        {/* API Configuration */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🌐 API Base URL Configuration</h2>
          
          {/* Current URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current API Base URL
            </label>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-300">
              <code className="text-sm text-gray-800 break-all">
                {currentUrl || 'Not configured'}
              </code>
            </div>
          </div>

          {/* New URL Input */}
          <div className="mb-4">
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Set New API Base URL
            </label>
            <input
              type="url"
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://your-api-server.com/api"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              ⚠️ All data will be fetched from this URL only. No Firebase or other sources.
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 
              message.includes('❌') ? 'bg-red-100 text-red-800' : 
              message.includes('🔄') ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={saveApiUrl}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {saving ? '💾 Saving...' : '💾 Save API URL'}
            </button>
            
            <button
              onClick={testApiConnection}
              disabled={testing || !currentUrl}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {testing ? '🔄 Testing...' : '🧪 Test Connection'}
            </button>
            
            <button
              onClick={resetApiUrl}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              🔄 Reset
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                ✖️ Close
              </button>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 API Test Results</h2>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Base URL:</p>
                <p className="font-mono text-sm">{testResults.baseUrl}</p>
              </div>
              
              {testResults.tests.map((test, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{test.name}</p>
                      <p className="text-sm">{test.status}</p>
                      {test.data && <p className="text-sm text-gray-600">{test.data}</p>}
                      {test.error && <p className="text-sm text-red-600">{test.error}</p>}
                    </div>
                    {test.time && <span className="text-sm text-gray-500">{test.time}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Batches List */}
        {batches.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📦 Available Batches ({batches.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <div 
                  key={batch.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => loadBatchContent(batch)}
                >
                  {batch.course_thumbnail && (
                    <img 
                      src={batch.course_thumbnail} 
                      alt={batch.course_name || batch.name}
                      className="w-full h-32 object-cover rounded mb-3"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <h3 className="font-semibold text-gray-900">{batch.course_name || batch.name}</h3>
                  <p className="text-sm text-gray-500">ID: {batch.id}</p>
                  <button className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded">
                    View Content
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Batch Content */}
        {selectedBatch && batchContent && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📂 Content: {selectedBatch.course_name || selectedBatch.name}
            </h2>
            <p className="text-sm text-gray-600 mb-4">Total items: {batchContent.length}</p>
            
            <div className="max-h-96 overflow-y-auto">
              {batchContent
                .filter(item => !batchContent.some(p => p.material_type === 'FOLDER' && String(p.id) === String(item.parent_id)))
                .map(item => renderContentItem(item, 0))}
            </div>
          </div>
        )}

        {/* API Endpoints Reference */}
        {currentUrl && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📡 API Endpoints</h2>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">Batches</h3>
                <code className="text-sm text-gray-600">{currentUrl}/batches</code>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">Content Root</h3>
                <code className="text-sm text-gray-600">{currentUrl}/content?course_id=&lt;batch_id&gt;</code>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">Folder Content</h3>
                <code className="text-sm text-gray-600">{currentUrl}/content?course_id=&lt;batch_id&gt;&parent_id=&lt;folder_id&gt;</code>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">Video Details</h3>
                <code className="text-sm text-gray-600">{currentUrl}/video-details?video_id=&lt;video_id&gt;&course_id=&lt;batch_id&gt;</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
