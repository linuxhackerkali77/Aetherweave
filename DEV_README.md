
# AetherDash Developer README

## 1. Project Overview

Welcome to the AetherDash codebase, Operator. This document is your guide to the architecture, systems, and conventions used in this application.

AetherDash is a futuristic, cyberpunk-themed web application built to serve as a user's central digital hub. It integrates real-time communication, note-taking, file management, and a powerful AI assistant into a single, cohesive interface. The aesthetic is heavily inspired by cyberpunk tropes, featuring neon glows, dark themes, and a "glassmorphism" UI style.

## 2. Core Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication, Storage)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (via `@genkit-ai/google-genai`)
- **State Management**: React Context + Custom Hooks
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

## 3. Project Structure

The `src` directory is organized to separate concerns and promote modularity.

```
/src
├── ai/
│   ├── flows/      # Genkit AI flows (server-side logic)
│   └── genkit.ts   # Genkit plugin configuration
├── app/
│   ├── (pages)/    # Next.js App Router routes
│   ├── api/        # API routes
│   └── layout.tsx  # Root layout
├── components/
│   ├── ai-hub/     # Components for the AI Hub page
│   ├── chat/       # Components specific to the Chat module
│   ├── dashboard/  # Widgets and components for the Dashboard
│   ├── layout/     # Header, UserNav, etc.
│   ├── settings/   # Panels for the Settings page
│   └── ui/         # Core ShadCN UI components (Button, Card, etc.)
├── firebase/
│   ├── client-provider.tsx # Client-side context provider
│   ├── config.ts   # Firebase app configuration
│   ├── index.ts    # Firebase app initialization
│   └── provider.tsx # React context for Firebase instances
├── hooks/
│   ├── use-user.ts # Central hook for user profile and auth state
│   ├── use-connections.ts # Manages user relationships (friends, blocks)
│   ├── use-notes.ts   # CRUD operations for notes
│   ├── use-webrtc.ts  # Handles video/voice call logic
│   └── ...         # Other custom hooks for specific features
├── lib/
│   ├── achievements.ts # Definitions for user achievements
│   ├── quests.ts   # Definitions for daily, weekly, seasonal quests
│   ├── store-items.ts # Data for items available in the XP store
│   ├── themes.ts   # Theme color definitions
│   └── utils.ts    # Utility functions (e.g., cn for classnames)
└── services/
    ├── cloudflare-service.ts # Backend service for Cloudflare WebRTC
    └── news-service.ts # Backend service for fetching news
```

## 4. Firebase Backend

The entire backend is powered by Firebase services.

### 4.1. Data Model (`/docs/backend.json`)

Our source of truth for the Firestore data model is `docs/backend.json`. This file defines all entities (like `User`, `Chat`, `Note`) and their corresponding Firestore collection paths. It's crucial for understanding how data is structured and related.

### 4.2. Security (`firestore.rules` & `storage.rules`)

Security is enforced via Firestore and Storage security rules. These files define the access control logic for the database and file storage, specifying who can read, write, update, or delete data in any given collection.

- **Firestore Rules**: Granular control over document access. For example, a user can only write to their own user document (`/users/{userId}`) but can read the public-facing data of other users.
- **Storage Rules**: Manages access to file uploads, typically restricting writes to a user's own directory.

### 4.3. Client-Side Integration (`/src/firebase`)

- **`config.ts`**: Contains the public Firebase configuration object.
- **`index.ts`**: Initializes the Firebase app on the client.
- **`provider.tsx`**: Creates a React Context that provides the initialized `app`, `auth`, and `firestore` instances to the rest of the application. This is consumed by all custom hooks that interact with Firebase.

## 5. Authentication

- **Providers**: Email/Password, Google, and Anonymous authentication are configured.
- **Routing**: The `middleware.ts` file performs an initial check on routes. However, the primary auth logic resides in `src/app/layout.tsx` within the `AppInitializer` component.
- **`AppInitializer`**: This client-side component uses the `useUser` hook to check the authentication state. It handles all redirection logic, ensuring unauthenticated users cannot access protected routes and authenticated users are redirected away from public pages like `/login`.

## 6. Generative AI (Genkit)

All AI functionality is handled by **Genkit**.

- **Location**: AI logic is located in `src/ai/`.
- **Flows**: A "flow" is a server-side function that orchestrates AI model calls. They are defined in `src/ai/flows/`. Each flow file typically exports a primary async function (e.g., `runAssistantStream`) and its associated Zod input/output schemas.
- **Configuration**: `src/ai/genkit.ts` configures the Genkit instance, specifying the `googleAI` plugin and the Next.js plugin for integration.
- **Calling Flows**: Client components import and call the exported flow functions directly. The Next.js server handles the communication. For streaming responses (like the AI Assistant), `AsyncIterable` is used.

## 7. State Management & Custom Hooks

The application avoids complex state management libraries like Redux in favor of a combination of **React Context** and **custom hooks**.

- **Providers**: The root layout wraps the application in several providers (`FirebaseClientProvider`, `ThemeProvider`, `UserProvider` via hooks) which expose global instances and state.
- **Custom Hooks**: The core logic and state for each major feature are encapsulated in custom hooks within the `src/hooks/` directory.
    - `useUser`: The most important hook. It manages the current user's authentication state and their Firestore profile data, providing a single source of truth for user information.
    - `useConnections`: Manages the user's social graph (friends, pending requests, blocked users).
    - `useNotes`, `useInventory`, etc.: Provide reactive state and CRUD functions for specific Firestore collections related to the user.

## 8. UI, Styling, and Theming

- **ShadCN/UI**: Provides the foundational, unstyled component primitives (Button, Card, etc.). These are located in `src/components/ui/`.
- **Tailwind CSS**: Used for all styling. Utility classes are applied directly in components.
- **Theming System**: The theming is controlled by CSS variables defined in `src/app/globals.css`.
    - **`src/lib/themes.ts`**: This file exports an array of `Theme` objects, each defining a set of HSL color values for `primary`, `secondary`, `background`, etc.
    - **`ThemeProvider.tsx`**: This context provider reads the user's saved theme preference (from `useUser`), finds the corresponding theme object, and applies its colors to the root CSS variables, instantly changing the application's look and feel. The provider also handles persisting theme changes back to the user's profile in Firestore.
- **Fonts**: The primary UI font is `Inter`, with `Space Grotesk` used for headlines to achieve the cyberpunk aesthetic, and `Source Code Pro` for code blocks.
- **Layout**: The main layout consists of a persistent `Header` and the `CoreNavHub` for navigation. The content for each page is rendered within this layout.
