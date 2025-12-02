'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useOnboarding, OnboardingStep } from '@/hooks/use-onboarding';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, X, Move } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/hooks/use-user';
import { tutorialSounds } from '@/lib/tutorial-sounds';

function getElementRect(selector: string): DOMRect | null {
  const element = document.querySelector(selector);
  return element ? element.getBoundingClientRect() : null;
}

const OnboardingTooltip = ({
  step,
  onNext,
  onSkip,
  isLast,
  stepIndex,
  totalSteps,
  position,
  onDrag,
}: {
  step: OnboardingStep;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
  stepIndex: number;
  totalSteps: number;
  position: { x: number; y: number };
  onDrag: (x: number, y: number) => void;
}) => {
  const { addXp } = useUser();
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step.id.includes('welcome') || step.id.includes('complete')) {
        addXp(50);
    } else {
        addXp(25);
    }
    
    // Play sound on next
    const audio = new Audio('/sounds/tutorial-next.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
    
    onNext();
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDrag={(_, info) => {
        onDrag(position.x + info.delta.x, position.y + info.delta.y);
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="glass-card w-full max-w-sm rounded-lg shadow-2xl z-[101] cursor-move border-2 border-primary/50"
      style={{ 
        boxShadow: '0 0 40px hsl(var(--primary) / 0.5), 0 0 80px hsl(var(--primary) / 0.3)',
        background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background)/0.9) 100%)'
      }}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-primary/60" />
            <h3 className="text-xl font-headline text-glow">{step.title}</h3>
          </div>
          <Badge variant="outline" className="text-xs bg-primary/20">
            Tutorial {stepIndex + 1}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">{step.content}</p>

        <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{stepIndex + 1} / {totalSteps}</p>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={onSkip} size="sm" className="text-muted-foreground hover:text-foreground">
            Skip
          </Button>
          <Button onClick={handleNext} className="cyber-button" size="sm">
            {isLast ? 'Complete' : 'Next'} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};


export default function OnboardingManager() {
  const { isActive, currentStepData, stepIndex, totalSteps, nextStep, skipTour, isLoading } = useOnboarding();
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [existingPopups, setExistingPopups] = useState<DOMRect[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Find safe position avoiding other popups
  const findSafePosition = () => {
    const popups = document.querySelectorAll('[data-popup], .toast, .dialog, .modal');
    const rects: DOMRect[] = [];
    popups.forEach(popup => {
      const rect = popup.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) rects.push(rect);
    });
    setExistingPopups(rects);
    
    // Find safe position on screen edges
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 384;
    const tooltipHeight = 300;
    
    const positions = [
      { x: 20, y: 20 }, // Top left
      { x: viewportWidth - tooltipWidth - 20, y: 20 }, // Top right
      { x: 20, y: viewportHeight - tooltipHeight - 20 }, // Bottom left
      { x: viewportWidth - tooltipWidth - 20, y: viewportHeight - tooltipHeight - 20 }, // Bottom right
      { x: viewportWidth / 2 - tooltipWidth / 2, y: 20 }, // Top center
      { x: viewportWidth / 2 - tooltipWidth / 2, y: viewportHeight - tooltipHeight - 20 }, // Bottom center
    ];
    
    for (const pos of positions) {
      const tooltipRect = { x: pos.x, y: pos.y, width: tooltipWidth, height: tooltipHeight };
      const hasCollision = rects.some(rect => 
        tooltipRect.x < rect.right + 20 &&
        tooltipRect.x + tooltipRect.width > rect.left - 20 &&
        tooltipRect.y < rect.bottom + 20 &&
        tooltipRect.y + tooltipRect.height > rect.top - 20
      );
      
      if (!hasCollision) {
        setPosition(pos);
        return;
      }
    }
    
    // Fallback to top-left if all positions have collisions
    setPosition({ x: 20, y: 20 });
  };

  useEffect(() => {
    if (isActive && !isLoading) {
      findSafePosition();
      
      // Recheck position when window resizes or new popups appear
      const observer = new MutationObserver(findSafePosition);
      observer.observe(document.body, { childList: true, subtree: true });
      window.addEventListener('resize', findSafePosition);
      
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', findSafePosition);
      };
    }
  }, [isActive, isLoading]);

  const handleDrag = (x: number, y: number) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 384;
    const tooltipHeight = 300;
    
    // Keep within screen bounds
    const boundedX = Math.max(0, Math.min(x, viewportWidth - tooltipWidth));
    const boundedY = Math.max(0, Math.min(y, viewportHeight - tooltipHeight));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  if (!isActive || !currentStepData || !isClient || isLoading) {
    return null;
  }

  const isLast = stepIndex === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <motion.div
        className="absolute pointer-events-auto"
        style={{
          left: position.x,
          top: position.y,
        }}
        initial={{ opacity: 0, scale: 0.5, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 50 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
      >
        <OnboardingTooltip
          step={currentStepData}
          onNext={nextStep}
          onSkip={skipTour}
          isLast={isLast}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          position={position}
          onDrag={handleDrag}
        />
      </motion.div>
    </div>
  );
}