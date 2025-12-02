
'use client';

import {
  Award,
  Box,
  BrainCircuit,
  CheckSquare,
  Cloud,
  Gamepad2,
  Home,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Newspaper,
  ShoppingBag,
  StickyNote,
  User,
  Users,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, Suspense } from 'react';
import { useUser } from '@/hooks/use-user';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useCursor } from '@/hooks/use-cursor';

const navItems = [
  { href: '/apps', label: 'Apps', icon: LayoutGrid },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '#gaming', label: 'Gaming', icon: Gamepad2, disabled: true, comingSoon: true },
  { href: '#news', label: 'News', icon: Newspaper, disabled: true, comingSoon: true },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/store', label: 'Store', icon: ShoppingBag },
  { href: '/inventory', label: 'Inventory', icon: Box },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/earnings', label: 'Earnings', icon: Award },
  { href: '/ai-hub', label: 'AI Hub', icon: BrainCircuit },
  { href: '/weather', label: 'Weather', icon: Cloud },
];

interface CoreNavHubProps {
  isOpen: boolean;
  constraintsRef: React.RefObject<HTMLDivElement>;
}

const CoreNavHub = ({ isOpen, constraintsRef }: CoreNavHubProps) => {
  const { profile, user } = useUser();
  const router = useRouter();
  const { setCursorMode } = useCursor();
  const pathname = usePathname();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ x: number, y: number, label: string } | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateY = useTransform(x, [-300, 300], [-10, 10]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  useEffect(() => {
    setLoadingHref(null);
    setAvatarLoading(false);
  }, [pathname]);

  useEffect(() => {
    // Prefetch all routes on mount
    navItems.forEach(item => {
      if (!item.disabled) router.prefetch(item.href);
    });
  }, [router]);

  const handleLinkClick = (href: string) => {
    if (pathname !== href) {
      setLoadingHref(href);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          drag
          dragConstraints={constraintsRef}
          onDragStart={() => {
            setCursorMode('drag', 'Drag');
            setIsDragging(true);
          }}
          onDragEnd={() => {
            setCursorMode('default');
            setIsDragging(false);
          }}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 15 }}
          dragElastic={0.1}
          onMouseMove={!isDragging ? handleMouseMove : undefined}
          onMouseLeave={handleMouseLeave}
          style={{ 
            rotateX: isDragging ? 0 : rotateX, 
            rotateY: isDragging ? 0 : rotateY, 
            transformStyle: 'preserve-3d',
            willChange: isDragging ? 'transform' : 'auto'
          }}
          className="fixed top-1/2 left-1/2 w-80 h-80 md:w-96 md:h-96"
        >
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Link href="/settings" onClick={() => setAvatarLoading(true)}>
              <motion.div
                onMouseEnter={() => setCursorMode('link')}
                onMouseLeave={() => setCursorMode('default')}
                className="relative"
              >
                <Avatar className="w-16 h-16 md:w-20 md:h-20 border-4 border-primary neon-glow-primary">
                  <AvatarImage src={profile?.photoURL || ''} />
                  <AvatarFallback>{profile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                {avatarLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </motion.div>
            </Link>
          </motion.div>
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <motion.circle
                  cx="50" cy="50" r="40"
                  stroke="hsl(var(--primary) / 0.2)"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="2 4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <motion.circle
                  cx="50" cy="50" r="40"
                  stroke="url(#xpGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - (profile?.xp ?? 100) / ((profile?.level ?? 1) * 1000 + 1000))}
                  transform="rotate(-90 50 50)"
                  filter="url(#glow)"
                  strokeLinecap="round"
                  animate={{ 
                    strokeDashoffset: [2 * Math.PI * 40 * (1 - (profile?.xp ?? 100) / ((profile?.level ?? 1) * 1000 + 1000)), 2 * Math.PI * 40 * (1 - (profile?.xp ?? 100) / ((profile?.level ?? 1) * 1000 + 1000)) - 10, 2 * Math.PI * 40 * (1 - (profile?.xp ?? 100) / ((profile?.level ?? 1) * 1000 + 1000))]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
          </svg>

          <motion.div
              className="w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
          >
            {navItems.map((item, index) => {
              const angle = (index / navItems.length) * 2 * Math.PI;
              const radius = window.innerWidth < 768 ? 110 : 130;
              const itemX = radius * Math.cos(angle);
              const itemY = radius * Math.sin(angle);
              const isActive = pathname.startsWith(item.href) && (item.href !== '/apps' || pathname === '/apps');
              const isLoading = loadingHref === item.href;

              const NavItem = item.disabled ? 'div' : Link;
              const navProps = item.disabled ? {} : { href: item.href, onClick: () => handleLinkClick(item.href) };
              
              return (
                <NavItem {...navProps} key={item.href}>
                  <motion.div
                      className={cn(
                          "absolute top-1/2 left-1/2 p-3 rounded-full flex items-center justify-center pointer-events-auto backdrop-blur-md border",
                          isActive 
                            ? 'bg-gradient-to-br from-primary/30 to-primary/10 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)] text-primary' 
                            : 'bg-gradient-to-br from-background/60 to-background/20 border-border/30 hover:border-primary/50 text-muted-foreground hover:text-primary'
                      )}
                      style={{
                          x: itemX - (window.innerWidth < 768 ? 20 : 24),
                          y: itemY - (window.innerWidth < 768 ? 20 : 24),
                      }}
                      whileHover={!isDragging ? { 
                        scale: 1.3, 
                        y: itemY - 37, 
                        x: itemX - 24, 
                        boxShadow: '0 0 30px hsl(var(--primary)/0.8), inset 0 0 20px hsl(var(--primary)/0.1)',
                        rotate: 360
                      } : {}}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      onMouseEnter={() => {
                        if (!isDragging) {
                          const label = item.comingSoon ? `${item.label} - Coming Soon` : item.label;
                          setHoveredItem({ x: itemX, y: itemY, label });
                          setCursorMode(item.disabled ? 'default' : 'link');
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredItem(null)
                        setCursorMode('default');
                      }}
                  >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : (
                        <motion.div
                          whileHover={!isDragging ? { rotate: 15, scale: 1.1 } : {}}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                        </motion.div>
                      )}
                  </motion.div>
                </NavItem>
              );
            })}
          </motion.div>

          <AnimatePresence>
              {hoveredItem && (
                  <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      style={{
                          x: hoveredItem.x,
                          y: hoveredItem.y - 70,
                      }}
                      className="absolute top-1/2 left-1/2 bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground text-sm font-mono px-4 py-2 rounded-lg shadow-[0_0_20px_hsl(var(--primary)/0.5)] border border-primary/30 backdrop-blur-sm pointer-events-none"
                  >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {hoveredItem.label}
                      </motion.span>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-primary/90 to-primary/70 rotate-45 border-r border-b border-primary/30"></div>
                  </motion.div>
              )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SuspendedCoreNavHub = (props: CoreNavHubProps) => (
    <Suspense fallback={null}>
        <CoreNavHub {...props} />
    </Suspense>
)

export default SuspendedCoreNavHub;

    