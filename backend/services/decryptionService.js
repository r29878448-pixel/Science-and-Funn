const crypto = require('crypto');

/**
 * AES-CBC Decryption Service
 * Decrypts encrypted PDF links using AES-CBC algorithm
 */
class DecryptionService {
  constructor() {
    this.key = Buffer.from(process.env.AES_KEY || '638udh3829162018', 'utf8');
    this.iv = Buffer.from(process.env.AES_IV || 'fedcba9876543210', 'utf8');
    this.algorithm = 'aes-128-cbc';
  }

  /**
   * Decrypt base64 encoded encrypted string
   * @param {string} encryptedText - Base64 encoded encrypted string
   * @returns {string} - Decrypted plain text
   */
  decrypt(encryptedText) {
    try {
      if (!encryptedText) {
        throw new Error('No encrypted text provided');
      }

      // Decode base64
      const encryptedBuffer = Buffer.from(encryptedText, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      
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
   * Decrypt PDF link from content item
   * @param {object} item - Content item with encrypted file_link
   * @returns {string|null} - Decrypted PDF URL or null
   */
  decryptPdfLink(item) {
    try {
      if (!item || !item.file_link) {
        return null;
      }

      // Check if link is already decrypted (starts with http)
      if (item.file_link.startsWith('http')) {
        return item.file_link;
      }

      // Decrypt the link
      return this.decrypt(item.file_link);
    } catch (error) {
      console.error('PDF link decryption error:', error.message);
      return null;
    }
  }

  /**
   * Validate decrypted URL
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid URL
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

module.exports = new DecryptionService();
