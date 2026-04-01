export default async function handler(req, res) {
  const { url, filename } = req.query;
  if (!url) return res.status(400).json({ error: 'url required' });

  try {
    const response = await fetch(decodeURIComponent(url), { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Fetch error: ${response.status}`);

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'download.pdf'}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
