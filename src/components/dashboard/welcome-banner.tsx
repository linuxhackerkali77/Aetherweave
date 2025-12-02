
'use client';
import { useUser } from '@/hooks/use-user';
import { Award, Bell, Zap } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import Link from 'next/link';

export function WelcomeBanner() {
    const { profile } = useUser();
    const { unreadCount } = useNotifications();
    
    // Fallback values if data is loading
    const displayLevel = profile?.level ?? 1;
    const displayXP = profile?.xp ?? 100;
    const displayUnread = unreadCount ?? 0;

  return (
    <div className="relative p-6 md:p-8 border-2 border-primary/50 bg-background/80 overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl md:text-3xl font-mono font-bold text-glow glitch-text">
            Welcome back, Operator.
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl font-mono">
            System status: nominal. All modules online. Your digital nexus awaits.
            </p>
        </div>
        <div className="flex-shrink-0 grid grid-cols-3 gap-4 text-center w-full md:w-auto mt-4 md:mt-0" data-onboarding-id="xp-bar">
            <Link href="/earnings" className="p-3 bg-muted/30 rounded-lg hover:bg-muted transition-colors">
                <p className="text-2xl font-bold text-glow">{displayLevel}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Award className="w-3 h-3"/> Level</p>
            </Link>
             <Link href="/earnings" className="p-3 bg-muted/30 rounded-lg hover:bg-muted transition-colors">
                <p className="text-2xl font-bold text-glow">{displayXP}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Zap className="w-3 h-3"/> XP</p>
            </Link>
            <Link href="/notifications" className="p-3 bg-muted/30 rounded-lg hover:bg-muted transition-colors">
                <p className="text-2xl font-bold text-glow">{displayUnread}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Bell className="w-3 h-3"/> Unread</p>
            </Link>
        </div>
      </div>
    </div>
  );
}

    