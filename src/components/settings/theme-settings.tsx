'use client';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Lock, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useState } from 'react';

export default function ThemeSettings() {
  const { theme: activeTheme, setTheme, themes } = useTheme();
  const { profile } = useUser();
  const inventory = profile?.inventory || [];
  const [equipping, setEquipping] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {themes.map((theme) => {
        const isDefault = ['cyber-default', 'amoled-noir', 'soft-gradient', 'mecha-pilot'].includes(theme.id);
        const isOwned = isDefault || inventory.includes(theme.id);
        const isLocked = !isOwned;
        const isEquipping = equipping === theme.id;
        
        const handleEquip = async () => {
          if (!isOwned) return;
          console.log('Equipping item', theme.id);
          setEquipping(theme.id);
          await setTheme(theme.id);
          setTimeout(() => setEquipping(null), 500);
        };
        
        return (
        <div key={theme.id} className="space-y-2">
          <Card
            onClick={handleEquip}
            className={cn(
              'transition-all relative',
              isOwned ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
              activeTheme === theme.id ? 'neon-border-primary' : isOwned && 'hover:bg-muted/50'
            )}
          >
            <CardContent className="p-0">
              {isEquipping && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-md z-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              )}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md z-10">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex -space-x-1 overflow-hidden rounded-t-md">
                <div className="flex-1 h-12 w-12" style={{ backgroundColor: `hsl(${theme.colors.primary})` }} />
                <div className="flex-1 h-12 w-12" style={{ backgroundColor: `hsl(${theme.colors.secondary})` }} />
                <div className="flex-1 h-12 w-12" style={{ backgroundColor: `hsl(${theme.colors.accent})` }} />
              </div>
              <div className="h-12 rounded-b-md" style={{ backgroundColor: `hsl(${theme.colors.background})` }} />
            </CardContent>
          </Card>
          <div className="flex items-center justify-center gap-2">
            {activeTheme === theme.id && <Check className="w-4 h-4 text-primary" />}
            {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
            <p className="text-sm font-semibold text-center">{theme.name}</p>
          </div>
        </div>
      )})}
    </div>
  );
}
