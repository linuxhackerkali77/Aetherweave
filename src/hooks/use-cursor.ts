
'use client';
import { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { useUser } from './use-user';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

export type CursorMode = 'default' | 'link' | 'text' | 'drag' | 'resize-ns' | 'resize-ew' | 'disabled';
export type CursorStyle = 'default-op' | 'neon-glow' | 'futuristic-trail' | 'spark-halo' | 'editor' | 'minimal-glow' | 'color-pulse';

export interface SmartCursorContextType {
  // State
  mode: CursorMode;
  text: string | null;
  style: CursorStyle;
  lowPerformanceMode: boolean;

  // API
  setCursorMode: (mode: CursorMode, text?: string | null) => void;
  setCursorStyle: (style: CursorStyle) => void;
  enableLowPerfMode: (enabled: boolean) => void;

  // Stubs for future implementation
  showTooltip: (text: string, options?: any) => void;
  hideTooltip: () => void;
  registerDraggable: (element: Element, options?: any) => void;
  unregisterDraggable: (element: Element) => void;
}

const CursorContext = createContext<SmartCursorContextType | undefined>(undefined);

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const { profile, updateProfileSettings } = useUser();

  const [mode, setMode] = useState<CursorMode>('default');
  const [text, setText] = useState<string | null>(null);
  const [style, setStyle] = useState<CursorStyle>('default-op');
  const [lowPerformanceMode, setLowPerformanceMode] = useState(false);

  // Load initial settings from profile
  useEffect(() => {
    if (profile) {
      setStyle(profile.settings?.cursor?.style as CursorStyle || 'default-op');
      setLowPerformanceMode(profile.settings?.cursor?.lowPerf || false);
    }
  }, [profile]);
  
  const setCursorMode = useCallback((newMode: CursorMode, text: string | null = null) => {
    if (typeof window === 'undefined') return;
    document.body.classList.toggle('cursor-none', newMode !== 'default' && newMode !== 'text');
    setMode(newMode);
    setText(text);
  }, []);

  const setCursorStyle = useCallback(async (newStyle: CursorStyle) => {
    setStyle(newStyle);
    await updateProfileSettings({ 
        ...profile?.settings, 
        cursor: { ...profile?.settings?.cursor, style: newStyle } 
    });
  }, [profile, updateProfileSettings]);

  const enableLowPerfMode = useCallback(async (enabled: boolean) => {
    setLowPerformanceMode(enabled);
    await updateProfileSettings({ 
        ...profile?.settings, 
        cursor: { ...profile?.settings?.cursor, lowPerf: enabled } 
    });
  }, [profile, updateProfileSettings]);

  // Stubs for future implementation
  const showTooltip = (text: string) => console.log('Show Tooltip:', text);
  const hideTooltip = () => console.log('Hide Tooltip');
  const registerDraggable = (el: Element) => console.log('Register Draggable:', el);
  const unregisterDraggable = (el: Element) => console.log('Unregister Draggable:', el);

  const contextValue = useMemo(() => ({
    mode,
    text,
    style,
    lowPerformanceMode,
    setCursorMode,
    setCursorStyle,
    enableLowPerfMode,
    showTooltip,
    hideTooltip,
    registerDraggable,
    unregisterDraggable,
  }), [mode, text, style, lowPerformanceMode, setCursorMode, setCursorStyle, enableLowPerfMode]);

  return <CursorContext.Provider value={contextValue}>{children}</CursorContext.Provider>;
};

export const useCursor = (): SmartCursorContextType => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
