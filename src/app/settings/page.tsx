
'use client';
import { useState } from 'react';
import {
  User,
  ShieldCheck,
  Palette,
  MousePointer2,
  Bell,
  Keyboard,
  Settings as SettingsIcon,
  Code,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';

// Import setting panel components
import AccountSettings from '@/components/settings/account-settings';
import AppearanceSettings from '@/components/settings/appearance-settings';
import InterfaceSettings from '@/components/settings/interface-settings';
import NotificationSettings from '@/components/settings/notification-settings';
import KeybindSettings from '@/components/settings/keybind-settings';
import AppSettings from '@/components/settings/app-settings';
import DeveloperSettings from '@/components/settings/developer-settings';

const settingsNav = [
  { id: 'account', label: 'My Account', icon: User, component: AccountSettings },
  { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceSettings },
  { id: 'interface', label: 'Interface', icon: MousePointer2, component: InterfaceSettings },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
  { id: 'keybinds', label: 'Keybinds', icon: Keyboard, component: KeybindSettings },
  { id: 'app-settings', label: 'App Settings', icon: SettingsIcon, component: AppSettings },
  { id: 'developer', label: 'Developer', icon: Code, component: DeveloperSettings },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const { profile, loading } = useUser();

  const ActiveComponent = settingsNav.find((item) => item.id === activeTab)?.component;

  if (loading || !profile) {
    return (
        <div className="grid md:grid-cols-[240px_1fr] gap-8 h-full">
            <div className="hidden md:block">
                <Skeleton className="h-12 w-full" />
                <div className="mt-8 space-y-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            </div>
            <div>
                <Skeleton className="h-full w-full" />
            </div>
        </div>
    );
  }


  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-x-12 h-full items-start">
      {/* Sidebar Navigation */}
      <aside className="hidden md:block pr-4">
        <nav className="flex flex-col gap-1">
          {settingsNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium rounded-md transition-colors',
                activeTab === item.id
                  ? 'bg-primary/20 text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="h-full overflow-y-auto custom-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
