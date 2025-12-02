'use client';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function ThemeSettings() {
  const { theme: activeTheme, setTheme, themes } = useTheme();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {themes.map((theme) => (
        <div key={theme.id} className="space-y-2">
          <Card
            onClick={() => setTheme(theme.id)}
            className={cn(
              'cursor-pointer transition-all',
              activeTheme === theme.id ? 'neon-border-primary' : 'hover:bg-muted/50'
            )}
          >
            <CardContent className="p-0">
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
            <p className="text-sm font-semibold text-center">{theme.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
