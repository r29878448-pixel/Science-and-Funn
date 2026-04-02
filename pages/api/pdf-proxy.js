/**
 * PDF Proxy API
 * Proxies PDF requests to avoid CORS and caching issues
 */

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ 
      success: false, 
      message: 'PDF URL is required' 
    });
  }

  try {
    console.log('📄 Proxying PDF:', url);

    // Fetch PDF from original URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    // Get PDF buffer
    const buffer = await response.arrayBuffer();

    // Set headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send PDF
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('❌ PDF proxy error:', error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to load PDF',
      error: error.message
    });
  }
}

// Increase body size limit for PDFs
export const config = {
  api: {
    responseLimit: '50mb',
  },
};
