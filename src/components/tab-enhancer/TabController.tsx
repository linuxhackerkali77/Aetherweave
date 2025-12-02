'use client';

import { useTabEnhancer } from '@/hooks/use-tab-enhancer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, 
  Palette, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MousePointer,
  Type,
  Sparkles
} from 'lucide-react';

export default function TabController() {
  const {
    showNotification,
    clearNotifications,
    setActivity,
    startColorCycle,
    simulateHover,
    setCustomTitle,
    notificationCount,
  } = useTabEnhancer();

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-glow">
          <Sparkles className="w-5 h-5 text-primary" />
          Tab Enhancement Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Notifications */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
            {notificationCount > 0 && (
              <Badge variant="destructive">{notificationCount}</Badge>
            )}
          </h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => showNotification(1)} size="sm" variant="outline">
              Add Notification
            </Button>
            <Button onClick={() => showNotification(5)} size="sm" variant="outline">
              Add 5 Notifications
            </Button>
            <Button onClick={clearNotifications} size="sm" variant="destructive">
              Clear All
            </Button>
          </div>
        </div>

        {/* Activity States */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Activity States
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={() => setActivity('loading')} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Loading
            </Button>
            <Button 
              onClick={() => setActivity('success')} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Success
            </Button>
            <Button 
              onClick={() => setActivity('error')} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Error
            </Button>
            <Button 
              onClick={() => setActivity('warning')} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              Warning
            </Button>
          </div>
        </div>

        {/* Visual Effects */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Visual Effects
          </h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={startColorCycle} size="sm" variant="outline">
              Color Cycle
            </Button>
            <Button onClick={simulateHover} size="sm" variant="outline">
              <MousePointer className="w-3 h-3 mr-1" />
              Hover Effect
            </Button>
          </div>
        </div>

        {/* Title Effects */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Type className="w-4 h-4" />
            Title Effects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button 
              onClick={() => setCustomTitle('◆ TYPING EFFECT ◆', 'typing')} 
              size="sm" 
              variant="outline"
            >
              Typewriter
            </Button>
            <Button 
              onClick={() => setCustomTitle('◆ GLITCH MODE ◆', 'glitch')} 
              size="sm" 
              variant="outline"
            >
              Glitch
            </Button>
            <Button 
              onClick={() => setCustomTitle('◆ PULSE ACTIVE ◆', 'pulse')} 
              size="sm" 
              variant="outline"
            >
              Pulse
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <p className="font-semibold mb-1">🚀 Features Active:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Dynamic favicon generation with Canvas API</li>
            <li>Real-time title animations and effects</li>
            <li>Tab visibility detection and reactions</li>
            <li>Notification badges and blinking alerts</li>
            <li>Color cycling and breathing animations</li>
            <li>Activity state indicators</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}