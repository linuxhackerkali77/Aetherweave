
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { themes, Theme } from '@/lib/themes';
import { useUser } from '@/hooks/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { usePathname } from 'next/navigation';

interface ThemeProviderContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeProviderContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const [activeTheme, setActiveTheme] = useState('cyber-default');
  const [isMounted, setIsMounted] = useState(false);
  
  const isGamingRoute = pathname.startsWith('/gaming');

  // Effect to set theme from user profile on load
  useEffect(() => {
    if (isGamingRoute) {
        setActiveTheme(profile?.gaming?.theme || 'neon-gamer');
    } else if (profile?.theme) {
        setActiveTheme(profile.theme);
    }
    setIsMounted(true);
  }, [profile, isGamingRoute]);

  // Effect to apply the active theme to the document
  useEffect(() => {
    const root = document.documentElement;
    const selectedTheme = themes.find(t => t.id === activeTheme);
    console.log('Applying theme:', activeTheme, selectedTheme);
    if (selectedTheme) {
      document.body.className = `theme-${selectedTheme.id}`;
      for (const [key, value] of Object.entries(selectedTheme.colors)) {
        root.style.setProperty(`--${key}`, value);
      }
    }
  }, [activeTheme]);

  const handleSetTheme = useCallback(async (themeId: string) => {
    console.log('Setting theme to:', themeId);
    setActiveTheme(themeId);
    if (profile && firestore) {
      try {
        const userDocRef = doc(firestore, 'users', profile.id);
        const fieldToUpdate = isGamingRoute ? { 'gaming.theme': themeId } : { theme: themeId };
        await setDoc(userDocRef, fieldToUpdate, { merge: true });
        console.log('Theme saved to Firestore');
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }
  }, [profile, firestore, isGamingRoute]);

  const contextValue = useMemo(() => ({
    theme: activeTheme,
    setTheme: handleSetTheme,
    themes,
  }), [activeTheme, handleSetTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
