
'use client';
import { useEffect, useRef, useCallback } from 'react';
import { appEventEmitter } from '@/lib/event-emitter';

type SoundType = 'hub-open' | 'hub-close' | 'click' | 'success' | 'error';

export function useSoundPlayer() {
  const audioContextRef = useRef<AudioContext>();
  const isInitialized = useRef(false);

  const initAudioContext = useCallback(() => {
    if (isInitialized.current || typeof window === 'undefined') return;
    
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      isInitialized.current = true;
      console.log('AudioContext initialized.');
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.", e);
    }
  }, []);

  useEffect(() => {
    // Add multiple event listeners to catch the first user interaction
    window.addEventListener('click', initAudioContext, { once: true });
    window.addEventListener('touchend', initAudioContext, { once: true });
    
    return () => {
      window.removeEventListener('click', initAudioContext);
      window.removeEventListener('touchend', initAudioContext);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    }
  }, [initAudioContext]);

  const playSound = useCallback((type: SoundType) => {
    if (!isInitialized.current) {
      return; // Don't try to play sound if not initialized
    }
      
    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state === 'closed') {
      return;
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Reduced volume for all sounds

    switch(type) {
      case 'hub-open':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.4);
        break;
      case 'hub-close':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
        break;
      case 'click':
        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
        break;
      case 'success':
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
        setTimeout(() => {
            if (audioContext.state === 'closed') return;
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.08, audioContext.currentTime);
            osc2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
            gain2.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.2);
        }, 80);
        break;
      case 'error':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
        break;
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [initAudioContext]);

  useEffect(() => {
    appEventEmitter.on('ui:sound', playSound);
    return () => {
      appEventEmitter.off('ui:sound', playSound);
    }
  }, [playSound]);
}
