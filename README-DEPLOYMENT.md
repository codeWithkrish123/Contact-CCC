# Vercel Deployment Guide - Contact-CCC

## Prerequisites
- Vercel account
- GitHub repository (recommended)
- Email service credentials (Gmail, etc.)

## Step 1: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel
```

### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the Node.js settings

## Step 2: Configure Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

### Required Variables:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RECAPTCHA_SECRET=6LfJXpYsAAAAAAP3034dEoGpF55F5T9u3YfeydDT
ALLOWED_ORIGIN=https://your-frontend-domain.vercel.app,http://localhost:5173,https://your-domain.com
```

### Optional Variables:
```
NODE_ENV=production
PORT=5000
```

## Step 3: Email Configuration

### For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password:
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Go to App Passwords
   - Generate new password for "Mail"
3. Use the app password as `EMAIL_PASS`

## Step 4: Update CORS Origins

Update the `ALLOWED_ORIGIN` variable to include:
- Your deployed frontend URL
- Development URLs (localhost)
- Any other domains that need access

## Step 5: Test Deployment

1. Deploy the application
2. Test the health endpoint: `https://your-app.vercel.app/health`
3. Test the contact form endpoint: `https://your-app.vercel.app/api/contact`

## Important Notes

- The server automatically exports for Vercel serverless functions
- Rate limiting is configured (5 requests per 2 minutes per IP)
- Security middleware is enabled
- The app includes comprehensive error handling

## Troubleshooting

### Common Issues:
1. **Email not sending**: Check EMAIL_USER and EMAIL_PASS
2. **CORS errors**: Verify ALLOWED_ORIGIN includes your frontend domain
3. **Deployment fails**: Check all environment variables are set

### Logs:
- Check Vercel function logs in the dashboard
- The app includes detailed logging for debugging

## Post-Deployment

1. Monitor your Vercel dashboard for function execution
2. Set up alerts for errors if needed
3. Regularly update your reCAPTCHA keys
4. Keep dependencies updated

## Security Considerations

- Never commit `.env` files to version control
- Use app-specific passwords for email
- Monitor for suspicious activity (built-in protection)
- Keep your dependencies updated
