
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useToast } from '@/hooks/use-toast';

export default function DeveloperSettings() {
  const { skipTour } = useOnboarding();
  const { toast } = useToast();

  const handleResetOnboarding = () => {
    // In a real app, you'd call a function from the useOnboarding hook to reset state
    localStorage.removeItem('aetherweave-onboarding-status');
    toast({
      title: "Onboarding Reset",
      description: "The onboarding tutorial will start on your next page load.",
    })
  };

  const handleClearCache = () => {
    // This is a simulation. Real cache clearing is more complex.
    toast({
      title: "Local Cache Cleared",
      description: "Application's local data has been purged.",
    })
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Tools</CardTitle>
        <CardDescription>Advanced options for developers and power users. Use with caution.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-background/30">
          <Label htmlFor="dev-mode" className="flex flex-col gap-1 cursor-pointer">
            <span>Enable Developer Mode</span>
            <span className="font-normal text-muted-foreground text-sm">Exposes additional debugging tools and options.</span>
          </Label>
          <Switch id="dev-mode" />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg border bg-destructive/10">
          <Label htmlFor="reset-onboarding" className="flex flex-col gap-1">
            <span>Reset Onboarding Tutorial</span>
            <span className="font-normal text-destructive/80 text-sm">This will restart the initial welcome tour.</span>
          </Label>
          <Button id="reset-onboarding" variant="destructive" onClick={handleResetOnboarding}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
         <div className="flex items-center justify-between p-4 rounded-lg border bg-destructive/10">
          <Label htmlFor="clear-cache" className="flex flex-col gap-1">
            <span>Clear Local Cache</span>
            <span className="font-normal text-destructive/80 text-sm">Force-clears all locally cached data.</span>
          </Label>
          <Button id="clear-cache" variant="destructive" onClick={handleClearCache}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
