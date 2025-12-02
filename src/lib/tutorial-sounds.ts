// Tutorial sound effects using Web Audio API
class TutorialSounds {
  private audioContext: AudioContext | null = null;
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  private createPopupSound(): AudioBuffer | null {
    if (!this.audioContext) return null;
    
    const duration = 0.3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const freq1 = 800 + Math.sin(t * 20) * 200;
      const freq2 = 1200;
      const envelope = Math.exp(-t * 8);
      data[i] = (Math.sin(t * freq1 * Math.PI * 2) * 0.3 + Math.sin(t * freq2 * Math.PI * 2) * 0.2) * envelope;
    }
    
    return buffer;
  }
  
  private createNextSound(): AudioBuffer | null {
    if (!this.audioContext) return null;
    
    const duration = 0.15;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const freq = 600;
      const envelope = Math.exp(-t * 15);
      data[i] = Math.sin(t * freq * Math.PI * 2) * envelope * 0.2;
    }
    
    return buffer;
  }
  
  playPopupSound() {
    if (!this.audioContext) return;
    
    const buffer = this.createPopupSound();
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = 0.3;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }
  
  playNextSound() {
    if (!this.audioContext) return;
    
    const buffer = this.createNextSound();
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = 0.2;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }
}

export const tutorialSounds = new TutorialSounds();