# Vercel Deployment Guide

## Frontend Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `.next`

### 3. Add Environment Variables (Frontend)
In Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
GOOGLE_AI_API_KEY=your_google_ai_key
```

### 4. Deploy
Click "Deploy" - Your frontend will be live at `https://your-app.vercel.app`

---

## Backend Deployment

### 1. Create Separate Backend Repository
```bash
cd backend
git init
git add .
git commit -m "Backend initial commit"
git remote add origin <your-backend-repo-url>
git push -u origin main
```

### 2. Deploy Backend on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your backend GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`

### 3. Add Environment Variables (Backend)
In Vercel Dashboard → Settings → Environment Variables:
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
PORT=4000
CORS_ORIGIN=https://your-frontend.vercel.app
GOOGLE_AI_API_KEY=your_google_ai_key
NODE_ENV=production
```

### 4. Deploy
Click "Deploy" - Your backend will be live at `https://your-backend.vercel.app`

---

## Update Frontend API URL

After backend deployment, update frontend environment variable:
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

Redeploy frontend for changes to take effect.

---

## Important Notes

1. **Socket.io Limitation**: Vercel serverless functions don't support WebSocket connections. For real-time features (calls, chat), consider:
   - Using Vercel's Edge Functions
   - Deploying backend to Railway/Render/Heroku
   - Using Firebase Realtime Database for signaling

2. **Cold Starts**: Serverless functions may have cold start delays

3. **Custom Domain**: Add custom domain in Vercel Dashboard → Settings → Domains

4. **Automatic Deployments**: Every push to main branch auto-deploys

---

## Alternative: Deploy Backend to Railway

For better WebSocket support:

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select backend repository
4. Add environment variables
5. Deploy

Railway URL: `https://your-app.railway.app`

---

## Testing

After deployment:
1. Visit frontend URL
2. Test login/signup
3. Test AI features
4. Test real-time features
5. Check browser console for errors

---

## Troubleshooting

- **Build Fails**: Check build logs in Vercel dashboard
- **API Errors**: Verify environment variables
- **CORS Issues**: Update CORS_ORIGIN in backend
- **Firebase Errors**: Check Firebase credentials
