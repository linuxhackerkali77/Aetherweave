'use client';

// hooks/use-call-sounds.ts
export const useCallSounds = () => {
  const playRingtone = () => {
    // Create ringtone using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
    
    // Loop every 2 seconds
    return setInterval(() => {
      const newOscillator = audioContext.createOscillator();
      const newGainNode = audioContext.createGain();
      
      newOscillator.connect(newGainNode);
      newGainNode.connect(audioContext.destination);
      
      newOscillator.type = 'sine';
      newOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      newOscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.5);
      
      newGainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      newGainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      newOscillator.start();
      newOscillator.stop(audioContext.currentTime + 1);
    }, 2000);
  };

  const playCallEndedSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.4);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.6);
  };

  const stopRingtone = (intervalId: NodeJS.Timeout) => {
    clearInterval(intervalId);
  };

  return {
    playRingtone,
    playCallEndedSound,
    stopRingtone
  };
};
