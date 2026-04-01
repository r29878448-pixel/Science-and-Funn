/**
 * POST /api/pw/live
 * Body: { batchId: "..." }
 * Returns live classes list with findKey for video playback
 */

const PW_BASE = 'https://apiserver-6hat.onrender.com';

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const batchId = req.query.batchId || req.body?.batchId;
  if (!batchId) return res.status(400).json({ error: 'batchId required' });

  try {
    const response = await fetch(`${PW_BASE}/api/pw/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) throw new Error(`Upstream error: ${response.status}`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ /api/pw/live error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
