# Contact Form Backend

A secure Node.js/Express backend for handling contact form submissions with email notifications, reCAPTCHA verification, and comprehensive security features.

## Features

- ✅ **Email Notifications** - Sends contact form data via Gmail/Nodemailer
- ✅ **reCAPTCHA Verification** - Bot protection with Google reCAPTCHA
- ✅ **Rate Limiting** - 5 requests per 15 minutes per IP
- ✅ **Progressive Slow Down** - Delays repeated requests
- ✅ **Input Sanitization** - XSS protection
- ✅ **Security Headers** - Helmet.js with strict CSP
- ✅ **IP Blocking** - Auto-blocks suspicious scanners (sqlmap, nmap, etc.)
- ✅ **CORS Protection** - Restricted to allowed origins
- ✅ **Health Check Endpoint** - Monitor server status
- ✅ **Graceful Shutdown** - Clean server termination

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Email:** Nodemailer (Gmail SMTP)
- **Security:** Helmet, express-rate-limit, express-slow-down, hpp
- **Validation:** Custom regex + input sanitization
- **Deployment:** Render.com

## Prerequisites

- Node.js 18+ installed
- Gmail account with App Password enabled
- Google reCAPTCHA v2 secret key

## Local Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Contact-CCC
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

# Gmail credentials (use App Password, not regular password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-16chars

# Google reCAPTCHA v2 Secret Key
RECAPTCHA_SECRET=your-recaptcha-secret-key

# Allowed frontend origins (comma-separated for multiple)
ALLOWED_ORIGIN=https://your-frontend.vercel.app,http://localhost:5174
```

**How to get Gmail App Password:**
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Enable **2-Step Verification** (required!)
3. Search **"App passwords"** → Select "Mail" + "Other"
4. Generate 16-character password

**How to get reCAPTCHA Secret:**
1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register your site (v2 Checkbox)
3. Copy the **Secret Key**

### 3. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check - returns server status |
| POST | `/api/contact` | Submit contact form |

### POST /api/contact

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "Hello, I have a question...",
  "recaptchaResponse": "recaptcha-token-or-mock-token"
}
```

**Success Response (200):**
```json
{
  "message": "Message sent successfully!"
}
```

**Error Responses:**
- `400` - Missing fields, invalid email, message too short
- `400` - reCAPTCHA verification failed
- `429` - Too many requests (rate limited)
- `500` - Server error

## Deployment to Render

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Create Web Service

1. Go to [render.com](https://render.com) → Dashboard
2. **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `contact-ccc` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Plan | Free |

### 3. Add Environment Variables

In Render Dashboard → Your Service → **Environment**:

| Key | Value |
|-----|-------|
| `EMAIL_USER` | your-email@gmail.com |
| `EMAIL_PASS` | your-app-password |
| `RECAPTCHA_SECRET` | your-recaptcha-secret |
| `ALLOWED_ORIGIN` | https://your-frontend.vercel.app |

### 4. Deploy

Click **Deploy**. Wait for build to complete.

Your API will be at: `https://contact-ccc.onrender.com`

## Frontend Integration

Update your frontend fetch call:

```javascript
const response = await fetch('https://contact-ccc.onrender.com/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test',
    message: 'Hello from frontend!',
    recaptchaResponse: 'your-recaptcha-token'
  })
});
```

## Security Features

| Feature | Protection |
|---------|-----------|
| Helmet.js | Security headers, CSP, HSTS |
| Rate Limiting | 5 req/15min per IP |
| Slow Down | Progressive delays after 2 requests |
| HPP | HTTP Parameter Pollution prevention |
| Input Sanitization | XSS prevention via HTML escaping |
| IP Blocking | Blocks scanners (sqlmap, nmap, burp) |
| Path Validation | Blocks `../` traversal attempts |
| CORS | Restricted to allowed origins only |
| Body Limit | 10kb max request size |

## Testing with Postman

**POST** `http://localhost:5000/api/contact`

Headers:
- `Content-Type: application/json`

Body (raw JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "subject": "Test",
  "message": "This is a test message for the contact form.",
  "recaptchaResponse": "mock-token"
}
```

## Troubleshooting

### "Missing credentials for PLAIN"
- `EMAIL_USER` or `EMAIL_PASS` is empty in `.env`
- Use Gmail App Password, not regular password

### "Invalid login: 535-5.7.8"
- Wrong App Password
- 2-Step Verification not enabled
- Account has "Less secure apps" disabled

### "CORS error"
- Frontend URL not in `ALLOWED_ORIGIN`
- Check protocol (http vs https)

### "Too many requests"
- Wait 15 minutes or use different IP
- Check `/health` endpoint works

## Project Structure

```
Contact-CCC/
├── controllers/
│   └── contactcontroller.js    # Form handling logic
├── routes/
│   └── contactRoutes.js         # API routes
├── utils/
│   └── sendEmail.js            # Email service
├── server.js                   # Main server file
├── .env                        # Environment variables (not in git)
├── .gitignore                  # Git ignore rules
└── package.json                # Dependencies
```

## License

ISC

## Support

For issues or questions, check the logs in Render Dashboard → Logs.
