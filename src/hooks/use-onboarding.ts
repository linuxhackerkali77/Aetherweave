'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tutorialSounds } from '@/lib/tutorial-sounds';

export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the element to highlight
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  nextPath?: string; // Path to navigate to for the next step
}

export interface OnboardingTour {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  requiredPath?: string;
  minLevel?: number;
}

const universalTour: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Aetherweave',
    content: 'Your cyberpunk digital hub. Let\'s get you oriented, Operator.',
    placement: 'center',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    content: 'Use the navigation to access different modules and features.',
    placement: 'center',
  },
  {
    id: 'complete',
    title: 'Ready to Go',
    content: 'You\'re all set! Explore and earn XP by using the system.',
    placement: 'center',
  },
];

export const tours: OnboardingTour[] = [
  { id: 'main', name: 'Quick Start', description: 'Essential basics', steps: universalTour },
];

const ONBOARDING_STORAGE_KEY = 'aetherweave-onboarding-status';
const TOURS_COMPLETED_KEY = 'aetherweave-tours-completed';

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isActive, setIsActive] = useState(false);
  const [currentTour, setCurrentTour] = useState<OnboardingTour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const tour = tours[0];
    setCurrentTour(tour);
    
    // Simulate page loading
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      
      try {
        const storedStatus = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        
        if (storedStatus !== 'completed') {
          const stepIndex = parseInt(storedStatus || '0', 10);
          setCurrentStep(stepIndex);
          setIsActive(true);
          
          // Play sound when tutorial appears
          tutorialSounds.playPopupSound();
        }
      } catch (error) {
        setCurrentStep(0);
        setIsActive(true);
      }
    }, 1500);
    
    return () => clearTimeout(loadTimer);
  }, []);

  const updateProgress = useCallback((stepIndex: number) => {
    try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, stepIndex.toString());
    } catch(e) {
        // ignore
    }
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTour) return;
    
    const nextStepIndex = currentStep + 1;

    if (nextStepIndex < currentTour.steps.length) {
      setCurrentStep(nextStepIndex);
      updateProgress(nextStepIndex);
    } else {
      setIsActive(false);
      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'completed');
      } catch (e) {
        // ignore
      }
    }
  }, [currentStep, updateProgress, currentTour]);

  const skipTour = useCallback(() => {
    setIsActive(false);
     try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'completed');
    } catch (e) {
        // ignore
    }
  }, []);

  const startTour = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  return {
    isActive: isActive && currentTour && currentStep < currentTour.steps.length && !isLoading,
    currentStepData: currentTour?.steps[currentStep],
    stepIndex: currentStep,
    totalSteps: currentTour?.steps.length || 0,
    isLoading,
    nextStep,
    skipTour,
    startTour,
  };
}
