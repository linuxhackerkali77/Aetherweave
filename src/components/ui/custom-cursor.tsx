
'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCursor } from '@/hooks/use-cursor';
import { cn } from '@/lib/utils';
import { Move, Link as LinkIcon } from 'lucide-react';
import { appEventEmitter } from '@/lib/event-emitter';

export default function SmartCursor() {
  const { mode, text, style, lowPerformanceMode } = useCursor();
  const cursorWrapperRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [rarityClass, setRarityClass] = useState('');
  
  const coords = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsClient(true);
    
    const handleMouseMove = (event: MouseEvent) => {
      coords.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    let animationFrameId: number;
    const animateCursor = () => {
      if (cursorWrapperRef.current) {
        cursorWrapperRef.current.style.transform = `translate3d(${coords.current.x}px, ${coords.current.y}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(animateCursor);
    };
    animateCursor();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const createEffectElement = (e: MouseEvent, className: string) => {
        const el = document.createElement('div');
        el.className = className;
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 500);
    };

    const handleSpark = (e: MouseEvent) => {
      for (let i = 0; i < 4; i++) {
        const spark = document.createElement('div');
        spark.className = 'cursor-spark';
        spark.style.left = `${e.clientX}px`;
        spark.style.top = `${e.clientY}px`;
        (spark.style as any).setProperty('--angle', `${i * 90}deg`);
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 300);
      }
    };
    
    const handleRipple = (e: MouseEvent) => createEffectElement(e, 'cursor-ripple');

    const handleRarityStart = (rarity: string) => setRarityClass(`cursor-rarity-${rarity.replace(' ', '_')}`);
    const handleRarityEnd = () => setRarityClass('');

    appEventEmitter.on('ui:click', handleSpark);
    appEventEmitter.on('ui:contextmenu', handleRipple);
    appEventEmitter.on('cursor:rarity-hover:start', handleRarityStart);
    appEventEmitter.on('cursor:rarity-hover:end', handleRarityEnd);

    return () => {
      appEventEmitter.off('ui:click', handleSpark);
      appEventEmitter.off('ui:contextmenu', handleRipple);
      appEventEmitter.off('cursor:rarity-hover:start', handleRarityStart);
      appEventEmitter.off('cursor:rarity-hover:end', handleRarityEnd);
    };
  }, [isClient]);

  useEffect(() => {
    document.body.classList.toggle('low-perf-mode', lowPerformanceMode);
  }, [lowPerformanceMode]);

  const renderIcon = () => {
    switch (mode) {
      case 'link': return <LinkIcon size={16} />;
      case 'drag': return <Move size={16} />;
      default: return null;
    }
  }

  if (!isClient) return null;

  return createPortal(
    <div
      ref={cursorWrapperRef}
      className={cn(
        'cursor-wrapper fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2',
        `cursor-style-${style}`,
        `cursor-variant-${mode}`,
        rarityClass
      )}
    >
      <div className="cursor-dot" />
      <div className="cursor-trail" />
      <div className="cursor-icon">{renderIcon()}</div>
      {mode === 'drag' && <div className="cursor-label">{text}</div>}
    </div>,
    document.body
  );
}

    