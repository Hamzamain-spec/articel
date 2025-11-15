
# Deployment Guide

## Recommended: Deploy on Replit (Easiest Option)

Your app is already configured for Replit deployment:

1. Click the "Deploy" button at the top right
2. Select "Autoscale" deployment type
3. Configure your deployment settings
4. Click "Deploy"

**Benefits of Replit Deployment:**
- Zero configuration needed
- Automatic scaling based on traffic
- Built-in environment management
- No additional setup required

## Alternative: Vercel Deployment

If you must use Vercel, follow these steps:

### Prerequisites
- Vercel account
- Vercel CLI installed: `npm i -g vercel`

### Steps

1. **Install dependencies locally:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel
   ```

4. **Set Environment Variables (if needed):**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add any API keys (GEMINI_API_KEY, GROQ_API_KEY) if you want them server-side

### Important Notes for Vercel

- The app will use serverless functions on Vercel
- File storage in `/output` directory may not persist between deployments
- For production use, consider using external storage (S3, etc.)
- API keys can be entered through the web UI or set as environment variables

### File Structure After Build
```
dist/
├── public/        # Static frontend files
└── index.js       # Server bundle
```

## Local Development

Use the provided scripts:
- Windows: Double-click `start.bat`
- Mac/Linux: Run `./start.sh`
- Manual: `npm install && npm run dev`

The app will be available at `http://localhost:5000`
