# Science and Fun - Secure Backend API

Production-ready Node.js backend with AES-CBC decryption for secure PDF handling.

## Features

✅ **Secure PDF Decryption** - AES-CBC decryption on backend  
✅ **Token-Based Access** - JWT tokens with expiry (5-10 minutes)  
✅ **API Caching** - 10-minute cache for better performance  
✅ **Rate Limiting** - Prevents abuse and scraping  
✅ **MVC Architecture** - Clean, maintainable code structure  
✅ **Error Logging** - Comprehensive error handling  
✅ **CORS Support** - Configurable origins  
✅ **Helmet Security** - Security headers enabled  

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables:
```env
PORT=5000
BASE_API_URL=https://your-api-server.com
JWT_SECRET=your-super-secret-key
AES_KEY=638udh3829162018
AES_IV=fedcba9876543210
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Content

#### Get Batches
```http
GET /api/content/batches
```

#### Get Course Content
```http
GET /api/content/:courseId?parent_id=optional
```

Response includes secure PDF access tokens:
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "title": "Chapter 1",
      "type": "PDF",
      "pdf_access_token": "eyJhbGc...",
      "pdf_url": "/api/pdf/123?token=eyJhbGc..."
    }
  ]
}
```

#### Update Base API URL (Admin)
```http
POST /api/content/config/update
Content-Type: application/json

{
  "baseUrl": "https://new-api-server.com"
}
```

### PDF Access

#### Get PDF (Stream/Redirect)
```http
GET /api/pdf/:id?token=JWT_TOKEN&course_id=123&parent_id=456
```

Streams PDF directly or redirects to decrypted URL.

#### Get PDF URL
```http
GET /api/pdf/:id/url?token=JWT_TOKEN&course_id=123&parent_id=456
```

Returns decrypted URL with 5-minute expiry warning.

### Authentication

#### Generate Token
```http
POST /api/auth/token
Content-Type: application/json

{
  "userId": "user123",
  "role": "user"
}
```

#### Verify Token
```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "eyJhbGc..."
}
```

## Security Features

1. **No Raw Links Exposed** - PDF links never sent to frontend
2. **Token Expiry** - PDF tokens expire in 5-10 minutes
3. **Rate Limiting** - 100 requests per 15 minutes per IP
4. **CORS Protection** - Configurable allowed origins
5. **Helmet Security** - Security headers enabled
6. **Input Validation** - All inputs validated
7. **Error Sanitization** - No sensitive data in errors

## Architecture

```
backend/
├── controllers/       # Request handlers
│   ├── contentController.js
│   ├── pdfController.js
│   └── authController.js
├── services/          # Business logic
│   ├── apiService.js
│   ├── decryptionService.js
│   └── tokenService.js
├── routes/            # API routes
│   ├── contentRoutes.js
│   ├── pdfRoutes.js
│   └── authRoutes.js
├── server.js          # Entry point
├── package.json
└── .env.example
```

## Decryption Logic

```javascript
// AES-128-CBC Decryption
Key: 638udh3829162018
IV: fedcba9876543210
Algorithm: aes-128-cbc

// Process:
1. Decode base64 encrypted string
2. Create decipher with key and IV
3. Decrypt using AES-CBC
4. Return UTF-8 plain text
```

## Caching

- API responses cached for 10 minutes
- Cache automatically cleared on config update
- Cache stats available at `/api/content/config/current`

## Error Handling

All errors return consistent format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Deployment

### Render/Heroku
```bash
# Set environment variables in dashboard
# Deploy from GitHub
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Health Check

```http
GET /health
```

Returns:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## License

MIT
