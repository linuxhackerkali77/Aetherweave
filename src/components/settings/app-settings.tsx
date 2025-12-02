
'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/hooks/use-user';
import { Check, Loader2 } from 'lucide-react';

export default function AppSettings() {
  const { profile, updateProfileSettings } = useUser();
  
  const [soundEnabled, setSoundEnabled] = useState(profile?.settings?.sound?.enableSounds ?? true);
  const [uiVolume, setUiVolume] = useState(profile?.settings?.sound?.uiVolume ?? 50);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfileSettings({
      ...profile?.settings,
      sound: {
        ...profile?.settings?.sound,
        enableSounds: soundEnabled,
        uiVolume: uiVolume,
      }
    });
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Settings</CardTitle>
        <CardDescription>Manage application-wide settings like sound and more.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-6 p-4 rounded-lg border bg-background/30">
            <div className="flex items-center justify-between">
                <Label htmlFor="enable-sounds" className="cursor-pointer">
                    Enable UI Sounds
                </Label>
                <Switch id="enable-sounds" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="space-y-3">
                <Label htmlFor="ui-volume">UI Sound Volume</Label>
                <div className="flex items-center gap-4">
                    <Slider
                        id="ui-volume"
                        min={0}
                        max={100}
                        step={1}
                        value={[uiVolume]}
                        onValueChange={(value) => setUiVolume(value[0])}
                        disabled={!soundEnabled}
                    />
                    <span className="w-12 text-center font-mono text-lg">{uiVolume}%</span>
                </div>
            </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Save Sound Settings
        </Button>
      </CardContent>
    </Card>
  );
}
