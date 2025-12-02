# AetherDash Backend API

Express.js backend server for AetherDash with Firebase integration and AI capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables
# Edit .env with your Firebase service account and API keys

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 📁 Project Structure

```
src/
├── config/
│   └── firebase.ts        # Firebase Admin SDK setup
├── controllers/
│   ├── userController.ts  # User management logic
│   └── aiController.ts    # AI endpoints logic
├── middleware/
│   ├── auth.ts           # JWT authentication
│   └── rateLimiter.ts    # Rate limiting
├── routes/
│   ├── userRoutes.ts     # User API routes
│   ├── aiRoutes.ts       # AI API routes
│   └── index.ts          # Main router
└── server.ts             # Express app setup
```

## 🔐 Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## 📡 API Endpoints

### Health Check
- `GET /` - Server status
- `GET /api/health` - Detailed health check

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

### AI Services
- `POST /api/ai/chat` - Chat with AI (streaming response)
- `POST /api/ai/generate-image` - Generate images from prompts
- `POST /api/ai/translate` - Translate text

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API abuse prevention
- **Firebase Auth** - Token verification
- **Input Validation** - Zod schema validation

## 🔧 Environment Variables

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# API Keys
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## 📊 Rate Limits

- **General API**: 100 requests per minute per IP
- **AI Endpoints**: 10 requests per minute per IP

## 🚀 Deployment

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
```

### Using PM2

```bash
npm install -g pm2
npm run build
pm2 start dist/server.js --name "aetherdash-backend"
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Development

```bash
# Start with file watching
npm run dev

# Lint code
npm run lint

# Type checking
npm run type-check
```