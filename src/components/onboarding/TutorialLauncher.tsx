'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOnboarding, tours } from '@/hooks/use-onboarding';
import { useUser } from '@/hooks/use-user';
import { BookOpen, Play, CheckCircle, Lock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TutorialLauncher() {
  const { profile } = useUser();
  const { startTour, getAvailableTours } = useOnboarding();
  const [open, setOpen] = useState(false);
  const availableTours = getAvailableTours();

  const canAccessTour = (tour: any) => {
    return !tour.minLevel || (profile?.level || 1) >= tour.minLevel;
  };

  const isCompleted = (tourId: string) => {
    return !availableTours.some(tour => tour.id === tourId);
  };

  const handleStartTour = (tourId: string) => {
    startTour(tourId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpen className="w-4 h-4 mr-2" />
          Tutorials
          {availableTours.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {availableTours.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Training Modules
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tours.map((tour) => {
            const completed = isCompleted(tour.id);
            const canAccess = canAccessTour(tour);
            const available = availableTours.some(t => t.id === tour.id);
            
            return (
              <Card 
                key={tour.id} 
                className={cn(
                  "transition-all",
                  completed && "bg-green-500/10 border-green-500/50",
                  !canAccess && "opacity-60",
                  available && canAccess && "ring-2 ring-primary/50"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tour.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {tour.minLevel && (
                        <Badge variant="outline" className="text-xs">
                          Level {tour.minLevel}+
                        </Badge>
                      )}
                      {completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : !canAccess ? (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Zap className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tour.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {tour.steps.length} steps
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleStartTour(tour.id)}
                      disabled={!canAccess}
                      variant={completed ? "outline" : "default"}
                    >
                      {completed ? (
                        <>Replay <Play className="w-3 h-3 ml-1" /></>
                      ) : !canAccess ? (
                        <>Locked <Lock className="w-3 h-3 ml-1" /></>
                      ) : (
                        <>Start <Play className="w-3 h-3 ml-1" /></>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {availableTours.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Tutorials Complete!</h3>
            <p className="text-muted-foreground">
              You've mastered all available training modules. New tutorials unlock as you level up.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}