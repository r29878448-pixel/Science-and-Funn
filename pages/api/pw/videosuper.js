const PW_BASE = 'https://apiserver-6hat.onrender.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { batchId, childId } = req.query;
  if (!batchId || !childId)
    return res.status(400).json({ error: 'batchId, childId required' });

  try {
    const url = `${PW_BASE}/api/pw/videosuper?batchId=${batchId}&childId=${childId}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
