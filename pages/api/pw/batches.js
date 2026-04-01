/**
 * /api/pw/batches
 * AES-256-GCM — key "maggikhalo" padded to 32 bytes
 * Format: { "data": "<iv_hex>:<ciphertext_hex>" }
 * Last 16 bytes of ciphertext = auth tag
 */
import crypto from 'crypto';

const PW_BASE = 'https://apiserver-6hat.onrender.com';
const DECRYPT_KEY = 'maggikhalo';

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

function decrypt(encryptedStr) {
  const colonIdx = encryptedStr.indexOf(':');
  if (colonIdx === -1) throw new Error('No ":" separator in encrypted string');

  const iv = Buffer.from(encryptedStr.slice(0, colonIdx), 'hex');
  const encryptedBytes = Buffer.from(encryptedStr.slice(colonIdx + 1), 'hex');

  const key = Buffer.alloc(32);
  Buffer.from(DECRYPT_KEY).copy(key);

  // Last 16 bytes = auth tag
  const authTag = encryptedBytes.slice(-16);
  const text = encryptedBytes.slice(0, -16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(text);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch(`${PW_BASE}/api/pw/batches`, {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Upstream ${response.status}`);

    const raw = await response.text();

    let encryptedStr;
    try {
      const json = JSON.parse(raw);
      encryptedStr = json?.data ?? json?.encrypted ?? json?.result ?? json?.payload;
      if (!encryptedStr || typeof encryptedStr !== 'string') {
        return res.status(200).json(json);
      }
    } catch (_) {
      encryptedStr = raw.trim();
    }

    const parsed = JSON.parse(decrypt(encryptedStr));
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('❌ /api/pw/batches:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
