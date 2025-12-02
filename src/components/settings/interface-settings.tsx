
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { useCursor, CursorStyle } from '@/hooks/use-cursor';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import AnimationSettings from './animation-settings';

const cursorStyles: { id: CursorStyle; name: string; description: string }[] = [
  { id: 'default-op', name: 'Default OP', description: 'Standard pointer with a soft neon glow and trail.' },
  { id: 'neon-glow', name: 'Neon Glow', description: 'Bright neon outline and a strong trailing streak.' },
  { id: 'futuristic-trail', name: 'Futuristic Trail', description: 'A sleek comet-like trail follows the pointer.' },
  { id: 'spark-halo', name: 'Spark & Halo', description: 'A halo around the pointer with sparks on click.' },
  { id: 'editor', name: 'Editor Style', description: 'Context-aware cursor for text, drag, and resize.' },
  { id: 'minimal-glow', name: 'Minimal Glow', description: 'A thin, performant outline that glows on hover.' },
  { id: 'color-pulse', name: 'Color Pulse', description: 'Pulses between primary and secondary colors.' },
];

function CursorSettings() {
  const { profile, updateProfileSettings } = useUser();
  const { setCursorStyle, enableLowPerfMode } = useCursor();
  
  const [selectedStyle, setSelectedStyle] = useState<CursorStyle>(profile?.settings?.cursor?.style as CursorStyle || 'default-op');
  const [isLowPerf, setIsLowPerf] = useState(profile?.settings?.cursor?.lowPerf || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfileSettings({
      ...profile?.settings,
      cursor: {
        style: selectedStyle,
        lowPerf: isLowPerf,
      }
    });
    // Apply changes immediately for visual feedback
    setCursorStyle(selectedStyle);
    enableLowPerfMode(isLowPerf);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cursorStyles.map((style) => (
          <Card
            key={style.id}
            onClick={() => setSelectedStyle(style.id)}
            className={cn(
              'cursor-pointer transition-all',
              selectedStyle === style.id ? 'neon-border-primary' : 'hover:bg-muted/50'
            )}
          >
            <CardContent className="p-4 text-center space-y-2">
              <div className="w-full aspect-square bg-muted rounded-md flex items-center justify-center">
                 <div className={cn("relative w-8 h-8", `cursor-style-${style.id}`)}>
                    <div className="cursor-dot !bg-white" style={{'--cursor-glow-color': 'white', '--cursor-trail-color': 'rgba(255,255,255,0.5)'} as React.CSSProperties}></div>
                    <div className="cursor-trail !opacity-50" style={{'--cursor-trail-color': 'rgba(255,255,255,0.5)'} as React.CSSProperties}></div>
                </div>
              </div>
              <p className="text-sm font-semibold">{style.name}</p>
              {selectedStyle === style.id && <Check className="w-4 h-4 mx-auto text-primary" />}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg border p-4 bg-background/50">
        <div>
          <Label htmlFor="low-perf-mode">Low-Performance Mode</Label>
          <p className="text-sm text-muted-foreground">
            Disables complex animations like trails and sparks for smoother operation.
          </p>
        </div>
        <Switch
          id="low-perf-mode"
          checked={isLowPerf}
          onCheckedChange={setIsLowPerf}
        />
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
        Save Interface Settings
      </Button>
    </div>
  );
}


export default function InterfaceSettings() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Cursor Customization</CardTitle>
          <CardDescription>Select your preferred cursor style for navigating the Aetherweave network.</CardDescription>
        </CardHeader>
        <CardContent>
          <CursorSettings />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Animation Settings</CardTitle>
          <CardDescription>Adjust the level of UI animations to match your performance needs.</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimationSettings />
        </CardContent>
      </Card>
    </div>
  );
}

    