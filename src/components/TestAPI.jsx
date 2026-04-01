// Test page to debug API response structure
import React, { useState } from 'react';
import { getFolderContent, getVideoDetails } from '../services/apiService';

const TestAPI = () => {
  const [batchId, setBatchId] = useState('80');
  const [folderId, setFolderId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testFolderContent = async () => {
    setLoading(true);
    try {
      console.log(`Testing: content?course_id=${batchId}&parent_id=${folderId}`);
      const data = await getFolderContent(batchId, folderId);
      console.log('API Response:', data);
      
      const items = data.data || [];
      const logEntry = {
        type: 'folder',
        url: `content?course_id=${batchId}&parent_id=${folderId}`,
        itemCount: items.length,
        items: items.map(i => ({
          id: i.id,
          title: i.Title || i.title || i.name,
          type: i.material_type || i.type,
          parent_id: i.parent_id,
          hasChildren: i.hasChildren || false
        }))
      };
      
      setResults(prev => [logEntry, ...prev]);
    } catch (error) {
      console.error('API Error:', error);
      setResults(prev => [{
        type: 'error',
        url: `content?course_id=${batchId}&parent_id=${folderId}`,
        error: error.message
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const testVideoDetails = async (videoId) => {
    try {
      const data = await getVideoDetails(videoId, batchId);
      console.log('Video Details:', data);
      
      setResults(prev => [{
        type: 'video',
        url: `video-details?video_id=${videoId}&course_id=${batchId}`,
        data: data.data
      }, ...prev]);
    } catch (error) {
      console.error('Video API Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Test Folder Content API</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course ID (Batch ID)</label>
            <input 
              type="text" 
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parent Folder ID</label>
            <input 
              type="text" 
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              placeholder="Leave empty for root"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <button 
          onClick={testFolderContent}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Loading...' : 'Test API Call'}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Results</h2>
        {results.map((result, index) => (
          <div key={index} className={`p-4 rounded-lg ${result.type === 'error' ? 'bg-red-50' : 'bg-white'} shadow`}>
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{result.url}</span>
              <span className={`text-sm px-2 py-1 rounded ${result.type === 'error' ? 'bg-red-200' : 'bg-green-200'}`}>
                {result.type === 'error' ? 'ERROR' : result.type.toUpperCase()}
              </span>
            </div>
            
            {result.type === 'folder' && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Found {result.itemCount} items</p>
                <div className="bg-gray-50 p-3 rounded overflow-auto max-h-64">
                  <pre className="text-xs">{JSON.stringify(result.items, null, 2)}</pre>
                </div>
              </div>
            )}
            
            {result.type === 'error' && (
              <p className="text-red-600 text-sm">{result.error}</p>
            )}
            
            {result.type === 'video' && (
              <div className="bg-gray-50 p-3 rounded">
                <pre className="text-xs">{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
        
        {results.length === 0 && (
          <p className="text-gray-500">No tests run yet. Click "Test API Call" to start.</p>
        )}
      </div>
    </div>
  );
};

export default TestAPI;
