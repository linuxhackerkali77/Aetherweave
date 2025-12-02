
'use client';
import { useState } from 'react';
import { Bell, Search, Grid } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserNav from './user-nav';
import NotificationPanel from './notification-panel';

import { useNotifications } from '@/hooks/use-notifications';
import AetherLogo from '../aether-logo';
import { cn } from '@/lib/utils';
import GlitchText from '@/components/ui/glitch-text';

interface HeaderProps {
  onNavToggle: () => void;
  isNavOpen: boolean;
}

export default function Header({ onNavToggle, isNavOpen }: HeaderProps) {
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b-2 border-primary/20">
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-3 py-1 text-center">
          <p className="text-xs md:text-sm font-mono text-yellow-400">
            <GlitchText>BETA VERSION</GlitchText> - IF YOU FIND ANY BUG THEN SEND TO WHATSAPP: 03122574283
          </p>
        </div>
        <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 md:gap-4 px-3 md:px-4 lg:px-8" role="banner">
        <div className="flex items-center gap-2">
            <AetherLogo className="w-6 h-6 md:w-8 md:h-8 text-primary" />
             <h1 className="hidden lg:block text-lg xl:text-xl font-bold font-mono capitalize text-glow">
                // AETHERWEAVE
            </h1>
             <h1 className="hidden md:block lg:hidden text-sm font-bold font-mono capitalize text-glow">
                AETHER
            </h1>
        </div>

        <div className="flex w-full items-center gap-2 md:gap-4 md:ml-auto lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="SEARCH..."
                className="pl-7 md:pl-8 text-xs md:text-sm w-full sm:w-[200px] md:w-[180px] lg:w-[300px] bg-input font-mono h-8 md:h-10"
                aria-label="Search commands and features"
              />
            </div>
          </form>
           <Button variant="ghost" size="sm" onClick={onNavToggle} className={cn("h-8 w-8 md:h-10 md:w-10", isNavOpen && 'bg-accent')} data-onboarding-id="nav-orb-toggle">
            <Grid className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span className="sr-only">Toggle Navigation Hub</span>
          </Button>

          <Button variant="ghost" size="sm" className="relative h-8 w-8 md:h-10 md:w-10" onClick={() => setIsNotificationsOpen(true)}>
            <Bell className="h-4 w-4 md:h-5 md:w-5 text-primary" />
             {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <UserNav />
        </div>
        </header>
      </div>
      <NotificationPanel isOpen={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
    </>
  );
}

    