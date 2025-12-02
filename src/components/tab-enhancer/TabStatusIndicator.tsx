'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette, Bell, Zap } from 'lucide-react';
import { useTabCard } from '@/hooks/use-tab-card';
import { useTabEnhancer } from '@/hooks/use-tab-enhancer';

export default function TabStatusIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const { startRainbow, stopEffects } = useTabCard();
  const { showNotification, clearNotifications } = useTabEnhancer();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="glass-card p-2"
      >
        <Palette className="w-4 h-4 text-primary" />
      </Button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 glass-card p-4 space-y-2 min-w-48">
          <div className="text-sm font-semibold text-primary">Tab Controls</div>
          
          <div className="flex gap-1">
            <Button onClick={startRainbow} size="sm" variant="outline">
              <Palette className="w-3 h-3 mr-1" />
              Rainbow
            </Button>
            <Button onClick={() => showNotification(1)} size="sm" variant="outline">
              <Bell className="w-3 h-3 mr-1" />
              Alert
            </Button>
          </div>
          
          <div className="flex gap-1">
            <Button onClick={stopEffects} size="sm" variant="ghost">
              Stop
            </Button>
            <Button onClick={clearNotifications} size="sm" variant="ghost">
              Clear
            </Button>
          </div>
          
          <Badge variant="secondary" className="text-xs">
            Tab Enhancement Active
          </Badge>
        </div>
      )}
    </div>
  );
}