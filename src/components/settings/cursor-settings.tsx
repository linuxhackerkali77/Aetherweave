'use client';
import { useState } from 'react';
import { useCursor, CursorStyle } from '@/hooks/use-cursor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const cursorStyles: { id: CursorStyle; name: string; description: string }[] = [
  { id: 'default-op', name: 'Default OP', description: 'Standard pointer with a soft neon glow and trail.' },
  { id: 'neon-glow', name: 'Neon Glow', description: 'Bright neon outline and a strong trailing streak.' },
  { id: 'futuristic-trail', name: 'Futuristic Trail', description: 'A sleek comet-like trail follows the pointer.' },
  { id: 'spark-halo', name: 'Spark & Halo', description: 'A halo around the pointer with sparks on click.' },
  { id: 'editor', name: 'Editor Style', description: 'Context-aware cursor for text, drag, and resize.' },
  { id: 'minimal-glow', name: 'Minimal Glow', description: 'A thin, performant outline that glows on hover.' },
  { id: 'color-pulse', name: 'Color Pulse', description: 'Pulses between primary and secondary colors.' },
];

export default function CursorSettings() {
  const { style: currentStyle, lowPerformanceMode, setCursorStyle, enableLowPerfMode } = useCursor();
  const [selectedStyle, setSelectedStyle] = useState<CursorStyle>(currentStyle);
  const [isLowPerf, setIsLowPerf] = useState(lowPerformanceMode);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        setCursorStyle(selectedStyle),
        enableLowPerfMode(isLowPerf)
      ]);
      toast({
        title: 'Settings Saved',
        description: 'Your interface settings have been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your cursor settings.',
      });
    } finally {
      setIsSaving(false);
    }
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
