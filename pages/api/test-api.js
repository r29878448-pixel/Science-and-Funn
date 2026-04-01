// Test API endpoint to check what we're getting
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('🧪 Testing API call...');
      
      // Import the current API service
      const { getBatches } = await import('../../src/services/apiService.js');
      
      // Make API call
      const response = await getBatches();
      
      console.log('📊 Raw API response:', response);
      console.log('📋 Response data:', response.data);
      
      if (response.data && response.data.length > 0) {
        console.log('📸 Sample batch with thumbnail:', response.data[0]);
        
        // Check thumbnail fields
        const thumbnailFields = response.data.map(batch => ({
          id: batch.id,
          name: batch.name,
          thumbnail: batch.thumbnail,
          image: batch.image,
          banner: batch.banner,
          icon: batch.icon,
          thumbnailUrl: batch.thumbnailUrl,
          imageUrl: batch.imageUrl
        }));
        
        console.log('🖼️ All thumbnail-like fields:', thumbnailFields);
      }
      
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      
      res.status(200).json({
        success: true,
        data: response.data,
        sampleBatch: response.data?.[0] || null,
        thumbnailFields: response.data?.map(batch => ({
          id: batch.id,
          name: batch.name,
          thumbnail: batch.thumbnail,
          image: batch.image,
          banner: batch.banner,
          icon: batch.icon,
          thumbnailUrl: batch.thumbnailUrl,
          imageUrl: batch.imageUrl
        })) || []
      });
    } catch (error) {
      console.error('🔥 Test API error:', error);
      
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
