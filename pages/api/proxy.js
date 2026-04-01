// Next.js API route for proxy to handle CORS
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }
      
      const decodedUrl = decodeURIComponent(url);
      console.log('🌐 Proxy API called for:', decodedUrl);
      
      // Fetch from the external API with proper headers
      let response;
      try {
        response = await fetch(decodedUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://studysagar.vercel.app/',
            'Origin': 'https://studysagar.vercel.app'
          },
          signal: AbortSignal.timeout(30000)
        });
      } catch (fetchError) {
        console.error('🔥 Fetch error:', fetchError.message);
        console.error('🔥 Fetch error type:', fetchError.name);
        console.error('🔥 Fetch error code:', fetchError.code);
        throw new Error(`Fetch failed: ${fetchError.message}`);
      }
      
      if (!response.ok) {
        console.log(`❌ API responded with status: ${response.status}`);
        // Try to get error message from response
        try {
          const errorText = await response.text();
          console.log(`❌ API Error Response: ${errorText.substring(0, 500)}`);
        } catch (e) {
          console.log('❌ Could not read error response');
        }
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('🔥 JSON parse error:', jsonError.message);
        const text = await response.text();
        console.error('🔥 Response text:', text.substring(0, 200));
        throw new Error('Invalid JSON response');
      }
      
      console.log('✅ Proxy API successful, data keys:', Object.keys(data));
      
      // 🔍 DEBUG: Log video-details response
      if (decodedUrl.includes('video-details')) {
        console.log('🔍 Video details response:', JSON.stringify(data, null, 2).substring(0, 500));
      }
      
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      
      res.status(200).json(data);
    } catch (error) {
      // 🔥 DEBUG: Log full error details
      console.error('🔥 Proxy API error:', error.message);
      console.error('🔥 Error stack:', error.stack);
      console.error('🔥 Request URL:', req.query.url);
      
      // Return error instead of mock data for debugging
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      
      return res.status(500).json({ 
        error: 'Proxy Error', 
        message: error.message,
        url: req.query.url 
      });
    }
  } else if (req.method === 'OPTIONS') {
    // Handle preflight requests
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(200).end();
  } else {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
