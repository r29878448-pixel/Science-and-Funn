import crypto from 'crypto';

/**
 * PDF Decryption API
 * Decrypts encrypted PDF links using AES-CBC
 */

// AES Decryption configuration
const AES_KEY = Buffer.from('638udh3829162018', 'utf8');
const AES_IV = Buffer.from('fedcba9876543210', 'utf8');
const ALGORITHM = 'aes-128-cbc';

/**
 * Decrypt base64 encoded encrypted string
 */
function decrypt(encryptedText) {
  try {
    if (!encryptedText) {
      throw new Error('No encrypted text provided');
    }

    // Decode base64
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, AES_KEY, AES_IV);
    
    // Decrypt
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt content');
  }
}

/**
 * Validate URL
 */
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { encrypted_link, pdf_id } = req.body;

    if (!encrypted_link) {
      return res.status(400).json({
        success: false,
        message: 'Encrypted link is required'
      });
    }

    console.log('🔐 Decrypting PDF:', pdf_id);

    // Check if already decrypted (starts with http)
    if (encrypted_link.startsWith('http')) {
      console.log('✅ Link already decrypted');
      return res.status(200).json({
        success: true,
        decrypted_url: encrypted_link,
        pdf_id
      });
    }

    // Decrypt the link
    const decryptedUrl = decrypt(encrypted_link);

    // Validate decrypted URL
    if (!isValidUrl(decryptedUrl)) {
      throw new Error('Invalid decrypted URL');
    }

    console.log('✅ PDF decrypted successfully');

    return res.status(200).json({
      success: true,
      decrypted_url: decryptedUrl,
      pdf_id,
      message: 'PDF decrypted successfully'
    });

  } catch (error) {
    console.error('❌ PDF decryption error:', error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to decrypt PDF link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
