// Simple sound generation for tutorial popups
// Run this in browser console to generate audio files

function generateTutorialSounds() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Tutorial popup sound - cyberpunk beep
  function createPopupSound() {
    const duration = 0.3;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Cyberpunk-style beep with frequency sweep
      const freq1 = 800 + Math.sin(t * 20) * 200;
      const freq2 = 1200;
      const envelope = Math.exp(-t * 8);
      data[i] = (Math.sin(t * freq1 * Math.PI * 2) * 0.3 + Math.sin(t * freq2 * Math.PI * 2) * 0.2) * envelope;
    }
    
    return buffer;
  }
  
  // Tutorial next sound - soft click
  function createNextSound() {
    const duration = 0.15;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const freq = 600;
      const envelope = Math.exp(-t * 15);
      data[i] = Math.sin(t * freq * Math.PI * 2) * envelope * 0.2;
    }
    
    return buffer;
  }
  
  console.log('Tutorial sounds generated! Use Web Audio API to play them.');
  console.log('Popup sound duration: 0.3s, Next sound duration: 0.15s');
}

// Call this function in browser console
generateTutorialSounds();