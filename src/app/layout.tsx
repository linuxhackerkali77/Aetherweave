
'use client';
import { ReactNode, useEffect, Suspense, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Inter, Source_Code_Pro, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import '@/app/globals.css';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import CoreNavHub from '@/components/layout/core-nav-hub';
import { CursorProvider } from '@/hooks/use-cursor';
import SmartCursor from '@/components/ui/custom-cursor';
import { CommandHubProvider } from '@/components/providers/CommandHubProvider';
import { useCommandHub } from '@/hooks/use-command-hub';
import OnboardingManager from '@/components/onboarding/OnboardingManager';
import { useSoundPlayer } from '@/hooks/use-sound-player';
import { useTabEnhancer } from '@/hooks/use-tab-enhancer';
import { useTabCard } from '@/hooks/use-tab-card';
import { tabIntegration } from '@/lib/tab-integration';
import TabStatusIndicator from '@/components/tab-enhancer/TabStatusIndicator';
import BreakingNewsNotifier from '@/components/news/BreakingNewsNotifier';
import IncomingCallNotification from '@/components/calls/IncomingCallNotification';
import CallInterface from '@/components/calls/CallInterface';
import { useUser } from '@/hooks/use-user';
import { Loader2 } from 'lucide-react';
import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider';
import { appEventEmitter } from '@/lib/event-emitter';
import { LoadingProvider } from '@/components/providers/LoadingProvider';
import Loader from '@/components/layout/loader';
import { enableFastMode } from '@/lib/performance';
import { CallProvider } from '@/contexts/CallContext';



const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-mono',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

const publicRoutes = ['/login', '/signup', '/forgot-password'];

function AppLayout({ children }: { children: ReactNode }) {
  useSoundPlayer();
  useTabEnhancer();
  useTabCard();
  const [isNavOpen, setIsNavOpen] = useState(true);
  
  useEffect(() => {
    tabIntegration.start();
    enableFastMode();
    return () => tabIntegration.stop();
  }, []);
  const layoutRef = useRef<HTMLDivElement>(null);
  const { openHub } = useCommandHub();
  const router = useRouter();

  useEffect(() => {
    // Prefetch common routes
    const routes = ['/apps', '/chat', '/news', '/notes', '/tasks', '/ai-hub', '/contacts', '/settings', '/profile'];
    routes.forEach(route => router.prefetch(route));
  }, [router]);

  const handleGlobalClick = (e: MouseEvent) => {
    appEventEmitter.emit('ui:click', e);
  };

  const handleGlobalContextMenu = useCallback((e: MouseEvent) => {
    const targetElement = e.target as HTMLElement;
    const isHubTrigger = targetElement.closest('[data-command-hub-trigger]');
    appEventEmitter.emit('ui:contextmenu', e);
    
    if (!isHubTrigger) {
        e.preventDefault();
        openHub(e as unknown as React.MouseEvent, {
            type: 'global',
            actions: [
                { label: 'Create Note', icon: 'StickyNote', onClick: () => router.push('/notes') },
                { label: 'Quick Commands', icon: 'Terminal', onClick: () => alert('Quick Commands Opened'), disabled: true },
                { label: 'Change Theme', icon: 'Palette', onClick: () => router.push('/settings'), disabled: true },
                { label: 'Paste', icon: 'ClipboardPaste', onClick: () => {}, disabled: true },
            ]
        });
    }
  }, [openHub, router]);


  useEffect(() => {
    const mainLayout = layoutRef.current;
    if (!mainLayout) return;

    mainLayout.addEventListener('click', handleGlobalClick);
    mainLayout.addEventListener('contextmenu', handleGlobalContextMenu);
    
    return () => {
        mainLayout.removeEventListener('click', handleGlobalClick);
        mainLayout.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, [handleGlobalContextMenu]);
  
  return (
    <div className="flex h-screen overflow-hidden" ref={layoutRef}>
      <div data-layout-container className="relative flex-1 flex flex-col overflow-hidden">
        <Header onNavToggle={() => setIsNavOpen(prev => !prev)} isNavOpen={isNavOpen}/>
        <main className="flex-1 overflow-y-auto p-3 md:p-6 lg:p-8 page-container" role="main" aria-label="Main content">{children}</main>
        <CoreNavHub isOpen={isNavOpen} constraintsRef={layoutRef} />
        <BreakingNewsNotifier />
        <TabStatusIndicator />
        <IncomingCallNotification />
        <CallInterface />
      </div>
    </div>
  );
}

function AppInitializer({ children }: { children: ReactNode }) {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [authResolved, setAuthResolved] = useState(false);

    useEffect(() => {
        if (!userLoading) {
            const isPublic = publicRoutes.includes(pathname);
            const isRoot = pathname === '/';
            
            if (user && (isPublic || isRoot)) {
                router.replace('/apps');
            } else if (!user && !isPublic && !isRoot) {
                router.replace('/login');
            } else {
                setAuthResolved(true);
            }
        }
    }, [userLoading, user, pathname, router]);

    if (!authResolved) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-primary">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }
    
    const isPublic = publicRoutes.includes(pathname);
    const isRoot = pathname === '/';
    const isAuthenticated = !!user;

    // Always show layout for authenticated users on non-public pages
    if (isAuthenticated && !isPublic && !isRoot) {
      return <AppLayout>{children}</AppLayout>;
    }
    
    // For public pages, root page, or when user is not authenticated
    return <>{children}</>;
}

function RootLayoutContent({ children }: { children: ReactNode }) {
    return (
        <AppInitializer>
            {children}
        </AppInitializer>
    );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AetherDash - Cyberpunk Digital Hub | AI-Powered Productivity Platform</title>
        <meta name="description" content="Experience the future with AetherDash - a cyberpunk-themed digital hub featuring AI assistance, real-time communication, task management, and advanced productivity tools. Built for the modern digital workspace." />
        <meta name="keywords" content="cyberpunk, digital hub, AI assistant, productivity, task management, real-time chat, video calls, note taking, file management, dashboard" />
        <meta name="author" content="AetherDash Team" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://aetherdash.com" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AetherDash - Cyberpunk Digital Hub" />
        <meta property="og:description" content="Experience the future with AetherDash - a cyberpunk-themed digital hub featuring AI assistance, real-time communication, and advanced productivity tools." />
        <meta property="og:url" content="https://aetherdash.com" />
        <meta property="og:site_name" content="AetherDash" />
        <meta property="og:image" content="https://aetherdash.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AetherDash - Cyberpunk Digital Hub" />
        <meta name="twitter:description" content="Experience the future with AetherDash - a cyberpunk-themed digital hub featuring AI assistance and productivity tools." />
        <meta name="twitter:image" content="https://aetherdash.com/og-image.jpg" />
        <meta name="twitter:creator" content="@aetherdash" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="application-name" content="AetherDash" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AetherDash" />
        
        {/* Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.aetherdash.com" />
        
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': 'AetherDash',
            'description': 'A cyberpunk-themed digital hub featuring AI assistance, real-time communication, and advanced productivity tools.',
            'url': 'https://aetherdash.com',
            'applicationCategory': 'ProductivityApplication',
            'operatingSystem': 'Web Browser',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD'
            },
            'author': {
              '@type': 'Organization',
              'name': 'AetherDash Team'
            },
            'screenshot': 'https://aetherdash.com/screenshot.jpg',
            'featureList': [
              'AI Assistant',
              'Real-time Chat',
              'Video Calls',
              'Task Management',
              'Note Taking',
              'File Management',
              'Dashboard Analytics'
            ]
          })
        }} />
      </head>
      <body className={cn('min-h-screen font-sans antialiased no-scrollbar overflow-hidden', inter.variable, sourceCodePro.variable, spaceGrotesk.variable)} suppressHydrationWarning>
        <FirebaseClientProvider>
          <LoadingProvider>
            <ThemeProvider>
              <CallProvider>
                <CursorProvider>
                  <CommandHubProvider>
                   <RootLayoutContent>{children}</RootLayoutContent>
                    <Toaster />
                    <FirebaseErrorListener />
                    <SmartCursor />
                    <OnboardingManager />
                    <Loader />

                  </CommandHubProvider>
                </CursorProvider>
              </CallProvider>
            </ThemeProvider>
          </LoadingProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
