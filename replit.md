# Aetherweave - Cyberpunk Digital Hub

## Overview
Aetherweave is a Next.js 15 application with a cyberpunk/neon aesthetic. It features three main dashboards: Normal, Gaming (Discord-like), and Developer (Monaco editor). The app uses Firebase (Firestore) for the backend with a focus on free tier compatibility.

## Current State
- Gaming Dashboard: Firebase integration for spaces, channels, categories, messages, and members
- Real-time updates using Firestore listeners
- Cyberpunk theming with dynamic theme switching

## Recent Changes
- 2024-12-05: Added Firebase-backed Gaming Spaces system with real-time updates
- 2024-12-05: Updated GamingNavbar, GamingSidebar, GamingChatArea, GamingMemberList to use Firebase
- 2024-12-05: Created use-spaces.ts hook for managing Discord-like servers
- 2024-12-05: Implemented CreateOrJoinSpaceModal with invite code functionality

## Project Architecture
```
src/
  app/
    gaming/           # Gaming Dashboard (Discord-like)
      components/     # Gaming-specific components
      page.tsx        # Main gaming page
    chat/             # Chat functionality
    developer/        # Developer Dashboard (planned)
  components/
    providers/        # Context providers
    ui/               # Shadcn UI components
    modals/           # Modal components
  hooks/
    use-spaces.ts     # Gaming spaces hook
    use-user.ts       # User authentication hook
    use-connections.ts # Friend connections hook
  firebase/
    config.ts         # Firebase configuration
    provider.tsx      # Firebase provider
```

## Known Issues
1. **Hydration Mismatch**: ThemeProvider applies CSS variables on the client which causes hydration warnings
2. **Invalid Hook Call**: NotFoundErrorBoundary (Next.js internal) shows hook errors during hydration recovery
3. **Build Errors**: Production build shows Html import errors for 404/500 pages (Turborepo/Next.js 15 known issue)

## User Preferences
- Firebase FREE tier only (Firestore available, Storage is premium)
- Focus on making functions actually work, not just UI mockups
- Base64 encoding for small images (server icons) stored in Firestore
- Cyberpunk/neon aesthetic with glowing borders, gradients

## Key Technologies
- Next.js 15 (App Router)
- Firebase/Firestore
- Tailwind CSS + Shadcn UI
- TypeScript
- Framer Motion for animations

## Environment Variables Required
- Firebase configuration (stored in env)
- SESSION_SECRET (for authentication)

## Development Notes
- The root layout uses 'use client' directive due to extensive client-side functionality
- Gaming system uses invite codes for joining spaces
- DM system reuses existing chat components from /chat route
