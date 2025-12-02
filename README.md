# AetherDash - Cyberpunk Digital Hub

A futuristic, cyberpunk-themed web application that serves as your central digital hub with real-time communication, AI assistance, note-taking, and file management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd aetherdash
npm run install:all
```

2. **Environment Setup:**
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Configure your Firebase and API keys in both .env files
```

3. **Start Development Servers:**
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

## 🏗️ Project Structure

```
/
├── src/                    # Frontend (Next.js)
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── firebase/          # Firebase client config
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API client
│   └── ai/                # Genkit AI flows
├── backend/               # Backend API (Express.js)
│   ├── src/
│   │   ├── config/        # Firebase Admin & configs
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, rate limiting, etc.
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── package.json
└── package.json           # Frontend dependencies
```

## 🔧 Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** ShadCN/UI + Tailwind CSS
- **Animation:** Framer Motion
- **State:** React Context + Custom Hooks

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **AI:** Google Gemini (via Genkit)
- **Security:** Helmet, CORS, Rate Limiting

## 📱 Features

- **🎨 Cyberpunk UI:** Dark theme with neon accents and glassmorphism
- **🤖 AI Assistant:** Powered by Google Gemini
- **💬 Real-time Chat:** Advanced messaging with WebRTC integration
- **📞 Voice & Video Calls:** WhatsApp-style calling with Cloudflare integration
- **📝 Notes & Tasks:** Organized productivity tools
- **🎮 Gaming Hub:** Social gaming features
- **⚙️ Customization:** Themes, settings, and preferences
- **🔐 Secure:** Firebase Auth + JWT tokens

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Frontend only (port 3000)
npm run dev:backend      # Backend only (port 5000)

# Building
npm run build            # Build both
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend

# Production
npm run start            # Start both in production
npm run start:frontend   # Frontend production server
npm run start:backend    # Backend production server

# AI Development
npm run genkit:dev       # Start Genkit development server
npm run genkit:watch     # Start Genkit with file watching
```

### API Endpoints

#### Authentication Required
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile  
- `GET /api/users/stats` - Get user statistics
- `POST /api/ai/chat` - Chat with AI (streaming)
- `POST /api/ai/generate-image` - Generate images
- `POST /api/ai/translate` - Translate text

#### Public
- `GET /api/health` - Health check

## 🔐 Environment Variables

### Frontend (.env)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (backend/.env)
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
PORT=5000
CORS_ORIGIN=http://localhost:3000
GOOGLE_AI_API_KEY=your_google_ai_key
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build:frontend
# Deploy dist folder
```

### Backend (Railway/Heroku/VPS)
```bash
cd backend
npm run build
npm run start
```

## 📚 Documentation

- [Development Guide](./DEV_README.md) - Detailed development documentation
- [API Documentation](./docs/api.md) - Backend API reference
- [Component Guide](./docs/components.md) - Frontend component documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@aetherdash.com
- 💬 Discord: [Join our community](https://discord.gg/aetherdash)
- 📖 Docs: [Documentation](https://docs.aetherdash.com)

---

Built with ❤️ for the cyberpunk future