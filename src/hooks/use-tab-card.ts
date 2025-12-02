'use client';

import { useEffect } from 'react';
import { tabCardEnhancer } from '@/lib/tab-card-enhancer';

export function useTabCard() {
  useEffect(() => {
    // Initialize with cyberpunk blue
    tabCardEnhancer.setTabColor('#00ffff');
    
    return () => {
      tabCardEnhancer.reset();
    };
  }, []);

  const setColor = (color: string, textColor?: string) => {
    tabCardEnhancer.setTabColor(color, textColor);
  };

  const startColorCycle = (colors?: string[]) => {
    tabCardEnhancer.startColorCycle(colors);
  };

  const startPulse = (baseColor?: string) => {
    tabCardEnhancer.startPulse(baseColor);
  };

  const startRainbow = () => {
    tabCardEnhancer.startRainbow();
  };

  const startGlitch = () => {
    tabCardEnhancer.startGlitch();
  };

  const setActivity = (type: 'loading' | 'error' | 'success' | 'warning') => {
    tabCardEnhancer.setActivity(type);
  };

  const flashNotification = (count?: number) => {
    tabCardEnhancer.flashNotification(count);
  };

  const stopEffects = () => {
    tabCardEnhancer.stopEffects();
  };

  const reset = () => {
    tabCardEnhancer.reset();
  };

  return {
    setColor,
    startColorCycle,
    startPulse,
    startRainbow,
    startGlitch,
    setActivity,
    flashNotification,
    stopEffects,
    reset,
  };
}