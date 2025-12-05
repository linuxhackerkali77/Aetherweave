'use client';

import { ReactNode, useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import BetaBanner from '@/components/layout/BetaBanner';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
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
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { appEventEmitter } from '@/lib/event-emitter';
import { LoadingProvider } from '@/components/providers/LoadingProvider';
import Loader from '@/components/layout/loader';
import { enableFastMode } from '@/lib/performance';
import { CallProvider } from '@/contexts/CallContext';

const publicRoutes = ['/', '/login', '/signup', '/forgot-password'];

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
    
    const isPublic = publicRoutes.includes(pathname);
    const isRoot = pathname === '/';

    useEffect(() => {
        if (!userLoading) {
            if (user && isPublic && !isRoot) {
                router.replace('/apps');
            } else if (!user && !isPublic) {
                router.replace('/login');
            } else {
                setAuthResolved(true);
            }
        }
    }, [userLoading, user, pathname, router, isPublic, isRoot]);

    // Show public pages immediately without waiting for auth
    if (isPublic || isRoot) {
        if (userLoading) {
            // Still show the page content for public routes, auth will redirect if needed
            return <>{children}</>;
        }
        if (user && !isRoot) {
            // User is logged in on a public page (not root), they'll be redirected
            return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-primary">Redirecting...</p>
                    </div>
                </div>
            );
        }
        return <>{children}</>;
    }

    // For protected routes, show loading until auth is resolved
    if (!authResolved) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-primary">Loading...</p>
                </div>
            </div>
        );
    }
    
    const isAuthenticated = !!user;

    if (isAuthenticated) {
      return <AppLayout>{children}</AppLayout>;
    }
    
    return <>{children}</>;
}

function RootLayoutContent({ children }: { children: ReactNode }) {
    return (
        <AppInitializer>
            {children}
        </AppInitializer>
    );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <LoadingProvider>
        <ThemeProvider>
          <CallProvider>
            <CursorProvider>
              <CommandHubProvider>
                <BetaBanner />
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
  );
}
