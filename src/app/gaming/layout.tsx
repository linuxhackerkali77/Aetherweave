
'use client';
import React from 'react';
import GamingSidebar from './components/GamingSidebar';
import GamingNavbar from './components/GamingNavbar';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function GamingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useUser();
  const [isPerfMode, setIsPerfMode] = React.useState(false);
  const [activeSpace, setActiveSpace] = React.useState<string | null>('aetherweave-hq');

  React.useEffect(() => {
    if (profile?.settings?.gaming?.performanceMode) {
      setIsPerfMode(profile.settings.gaming.performanceMode);
    }
  }, [profile]);
  
  React.useEffect(() => {
    const root = document.documentElement;
    if (!root) return;

    if (isPerfMode) {
        root.classList.add('perf-mode');
    } else {
        root.classList.remove('perf-mode');
    }
  }, [isPerfMode]);

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { activeSpace } as any);
    }
    return child;
  });

  return (
    <div className={cn("flex flex-col h-screen bg-background text-foreground")}>
      <GamingNavbar activeSpace={activeSpace} setActiveSpace={setActiveSpace} />
      <main className="flex flex-1 overflow-hidden">
        <GamingSidebar />
        {childrenWithProps}
      </main>
    </div>
  );
}
