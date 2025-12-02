
'use client';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from '../ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';

type AnimationLevel = 'none' | 'basic' | 'full';

const levels: { id: AnimationLevel; name: string; description: string }[] = [
  { id: 'none', name: 'None', description: 'Disables all non-essential UI animations for maximum performance.' },
  { id: 'basic', name: 'Basic', description: 'Enables simple fades and transitions. Recommended for most systems.' },
  { id: 'full', name: 'Full', description: 'Enables all UI effects, including glows, particles, and complex animations.' },
];

export default function AnimationSettings() {
  const { profile, updateProfileSettings } = useUser();
  const [selectedLevel, setSelectedLevel] = useState<AnimationLevel>(profile?.settings?.animations?.level || 'full');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfileSettings({
        ...profile?.settings,
        animations: {
            level: selectedLevel
        }
    });
    setIsSaving(false);
  }

  return (
    <div className="space-y-6">
      <RadioGroup value={selectedLevel} onValueChange={(value: AnimationLevel) => setSelectedLevel(value)} className="space-y-4">
        {levels.map((level) => (
          <Label 
            key={level.id}
            htmlFor={level.id}
            className={cn(
                "flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all bg-background/30",
                selectedLevel === level.id && "neon-border-primary"
            )}
          >
            <RadioGroupItem value={level.id} id={level.id} className="mt-1"/>
            <div className="flex flex-col gap-1">
              <span className="font-bold">{level.name}</span>
              <span className="font-normal text-muted-foreground text-sm">{level.description}</span>
            </div>
          </Label>
        ))}
      </RadioGroup>
       <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
        Save Animation Settings
      </Button>
    </div>
  );
}
