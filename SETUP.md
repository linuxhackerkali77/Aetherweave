# 🚀 AetherDash Setup Guide

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
# Windows
start-dev.bat

# Mac/Linux
chmod +x start-dev.sh
./start-dev.sh
```

### 2. Configure Environment Variables

**Frontend (.env):**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDQXx_TQylXDvIKHf-ud_7T8RbRdTC91ng
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-4634736248-c0b42.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-4634736248-c0b42
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-4634736248-c0b42.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=185134863770
NEXT_PUBLIC_FIREBASE_APP_ID=1:185134863770:web:4af101ef873aed44105623
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-S33W1P5G5D
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend (backend/.env):**
```env
FIREBASE_PROJECT_ID=studio-4634736248-c0b42
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Firebase Service Account Setup ✅

**Already configured!** Your Firebase service account credentials have been automatically set up in `backend/.env`.

If you need to update them later:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studio-4634736248-c0b42`
3. Go to Project Settings > Service Accounts
4. Generate a new private key if needed

### 4. Start Development

```bash
npm run dev
```

**Servers will start on:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔧 Manual Setup

### Install Dependencies Separately
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### Start Servers Individually
```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend  
npm run dev:backend
```

## 🧪 Test the Setup

1. **Frontend Test:** Visit http://localhost:3000
2. **Backend Test:** Visit http://localhost:5000/api/health
3. **Database Test:** Try logging in/signing up

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill processes on ports
npx kill-port 3000 5000
```

**Firebase Connection Issues:**
- Check your `.env` files
- Verify Firebase project ID
- Ensure service account has proper permissions

**Module Not Found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm run install:all
```

### Environment Check
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Verify Firebase CLI (optional)
firebase --version
```

## 📱 Next Steps

1. **Customize Themes:** Edit `src/lib/themes.ts`
2. **Add Features:** Check `DEV_README.md` for architecture
3. **Deploy:** Follow deployment guides in main README
4. **Configure AI:** Add Google AI API key for AI features

## 🆘 Need Help?

- Check the main [README.md](./README.md)
- Review [DEV_README.md](./DEV_README.md) for detailed docs
- Open an issue on GitHub