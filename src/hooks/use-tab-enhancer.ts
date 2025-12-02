'use client';

import { useEffect, useRef } from 'react';
import { tabEnhancer } from '@/lib/tab-enhancer';

export function useTabEnhancer() {
  const notificationCount = useRef(0);

  useEffect(() => {
    // Initialize with cyberpunk theme
    tabEnhancer.setTitle('◆ AETHERWEAVE ◆', 'typing');
    
    // Start breathing effect on load
    setTimeout(() => {
      tabEnhancer.startBreathing();
    }, 2000);

    return () => {
      tabEnhancer.reset();
    };
  }, []);

  const showNotification = (count: number = 1) => {
    notificationCount.current += count;
    tabEnhancer.showNotification(notificationCount.current);
  };

  const clearNotifications = () => {
    notificationCount.current = 0;
    tabEnhancer.clearNotification();
  };

  const setActivity = (type: 'loading' | 'error' | 'success' | 'warning') => {
    tabEnhancer.setActivity(type);
  };

  const startColorCycle = () => {
    tabEnhancer.startColorCycle(['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0080']);
  };

  const simulateHover = () => {
    tabEnhancer.simulateHover();
  };

  const setCustomTitle = (title: string, effect?: 'typing' | 'glitch' | 'pulse') => {
    tabEnhancer.setTitle(title, effect);
  };

  return {
    showNotification,
    clearNotifications,
    setActivity,
    startColorCycle,
    simulateHover,
    setCustomTitle,
    notificationCount: notificationCount.current,
  };
}