'use client';

class TabCardEnhancer {
  private styleElement: HTMLStyleElement | null = null;
  private colorInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.injectStyles();
    }
  }

  private injectStyles() {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'tab-card-enhancer';
    document.head.appendChild(this.styleElement);
  }

  // Change entire tab card color
  setColor(color: string, textColor: string = '#ffffff') {
    this.setTabColor(color, textColor);
  }

  setTabColor(color: string, textColor: string = '#ffffff') {
    if (!this.styleElement) return;
    
    this.styleElement.textContent = `
      /* Chrome/Edge Tab Styling */
      :root {
        --tab-bg-color: ${color};
        --tab-text-color: ${textColor};
      }
      

      
      /* Meta theme color for mobile browsers */
      meta[name="theme-color"] {
        content: ${color} !important;
      }
      

      
      /* Scrollbar styling to match */
      ::-webkit-scrollbar {
        width: 8px;
      }
      ::-webkit-scrollbar-track {
        background: ${color}20;
      }
      ::-webkit-scrollbar-thumb {
        background: ${color};
        border-radius: 4px;
      }
    `;
    
    // Update theme-color meta tag
    this.updateThemeColor(color);
  }

  private updateThemeColor(color: string) {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = color;
  }

  // Animated color cycling for full tab
  startColorCycle(colors: string[] = ['#ff0080', '#0080ff', '#80ff00', '#ff8000', '#8000ff']) {
    if (this.colorInterval) clearInterval(this.colorInterval);
    
    let colorIndex = 0;
    this.colorInterval = setInterval(() => {
      this.setTabColor(colors[colorIndex]);
      colorIndex = (colorIndex + 1) % colors.length;
    }, 1000);
  }

  // Pulsing effect
  startPulse(baseColor: string = '#00ffff') {
    if (this.colorInterval) clearInterval(this.colorInterval);
    
    let intensity = 0;
    this.colorInterval = setInterval(() => {
      const alpha = (Math.sin(intensity) + 1) / 2;
      const brightness = 0.5 + alpha * 0.5;
      
      if (!this.styleElement) return;
      
      this.styleElement.textContent = `

      `;
      
      this.updateThemeColor(`${baseColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
      intensity += 0.2;
    }, 100);
  }

  // Rainbow effect
  startRainbow() {
    if (this.colorInterval) clearInterval(this.colorInterval);
    
    let hue = 0;
    this.colorInterval = setInterval(() => {
      const color = `hsl(${hue}, 70%, 50%)`;
      this.setTabColor(color);
      hue = (hue + 10) % 360;
    }, 100);
  }

  // Glitch effect
  startGlitch() {
    if (this.colorInterval) clearInterval(this.colorInterval);
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    this.colorInterval = setInterval(() => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      this.setTabColor(randomColor);
    }, 150);
    
    // Stop glitch after 3 seconds
    setTimeout(() => {
      this.stopEffects();
      this.setTabColor('#00ffff');
    }, 3000);
  }

  // Activity-based colors
  setActivity(type: 'loading' | 'error' | 'success' | 'warning') {
    const configs = {
      loading: '#ffd700',
      error: '#ff4757', 
      success: '#2ed573',
      warning: '#ffa502'
    };
    
    this.setTabColor(configs[type]);
    
    // Auto-reset after 3 seconds
    setTimeout(() => {
      this.setTabColor('#00ffff');
    }, 3000);
  }

  // Stop all effects
  stopEffects() {
    if (this.colorInterval) {
      clearInterval(this.colorInterval);
      this.colorInterval = null;
    }
    if (this.styleElement) {
      this.styleElement.textContent = '';
    }
  }

  // Reset to default
  reset() {
    this.stopEffects();
    if (this.styleElement) {
      this.styleElement.textContent = '';
    }
    this.updateThemeColor('#000000');
  }

  // Notification flash
  flashNotification(count: number = 1) {
    let flashes = 0;
    const flashInterval = setInterval(() => {
      if (flashes % 2 === 0) {
        this.setTabColor('#ff0066');
      } else {
        this.setTabColor('#000000');
      }
      flashes++;
      
      if (flashes >= count * 2) {
        clearInterval(flashInterval);
        this.setTabColor('#00ffff');
      }
    }, 300);
  }
}

export const tabCardEnhancer = new TabCardEnhancer();