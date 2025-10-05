# Deployment Instructions for ExoClassifier

## CORS Issue Fix

This project includes a solution for CORS issues when deploying to Vercel. The backend API at `https://exoplanet-classifier-backend-api.onrender.com` doesn't allow cross-origin requests from arbitrary domains.

## Batch Processing Fix

Additionally, the CSV batch processing has been updated to work around the file upload CORS limitation by:
- Processing CSV files locally in the browser
- Making individual prediction requests for each row
- Combining results into a batch response
- This ensures compatibility with the proxy system

## Solution: Vercel Serverless Proxy

We've implemented a Vercel serverless function (`/api/proxy.js`) that acts as a proxy to handle CORS:

### Files Added:
- `/api/proxy.js` - Vercel serverless function for API proxy
- `vercel.json` - Vercel configuration
- `.env` - Environment variables with proxy enabled

### How It Works:

1. **Development**: Uses Vite's built-in proxy (`/api` → backend)
2. **Production**: Uses Vercel serverless function (`/api/proxy` → backend)

## Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add CORS proxy fix for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite project
   - Deploy

3. **Environment Variables** (Optional):
   If you need to customize, set these in Vercel dashboard:
   - `VITE_API_BASE_URL`: Backend API URL (already set in .env)
   - `VITE_USE_PROXY`: true (already set in .env)

## Architecture

```
Frontend (Vercel) → Vercel Serverless Function (/api/proxy) → Backend (Render)
```

The proxy function:
- Accepts requests from your frontend
- Forwards them to the backend API
- Returns responses with proper CORS headers
- Handles JSON requests (single predictions)

Batch processing works by:
- Reading CSV files locally in the browser
- Processing each row as individual single predictions
- Combining all results into a batch response
- Avoiding the need for file upload through proxy

## Testing

After deployment:
1. Visit your deployed URL
2. Try the exoplanet classification feature
3. Check browser console for any errors
4. The proxy should handle all API calls seamlessly

## Troubleshooting

If you still get CORS errors:

1. **Check Vercel Logs**:
   - Go to Vercel dashboard → Your project → Functions
   - Check `/api/proxy` logs

2. **Verify Environment Variables**:
   - Ensure `VITE_USE_PROXY=true` is set

3. **Test Proxy Directly**:
   - Visit `https://your-domain.vercel.app/api/proxy?path=/`
   - Should return the backend health check

## Alternative Solutions

If the proxy doesn't work:

1. **Backend CORS Update**: Ask backend developer to add your domain to CORS origins
2. **Same-Domain Deployment**: Deploy both frontend and backend on same domain
3. **Public CORS Proxy**: Use services like `cors-anywhere.herokuapp.com` (not recommended for production)

## Local Development

The proxy is automatically disabled in development. Vite's built-in proxy handles CORS locally.