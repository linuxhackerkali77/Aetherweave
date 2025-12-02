'use client';

interface TabState {
  title: string;
  favicon: string;
  color: string;
  isActive: boolean;
  notifications: number;
}

class TabEnhancer {
  private originalTitle: string = '';
  private originalFavicon: string = '';
  private isBlinking: boolean = false;
  private blinkInterval: NodeJS.Timeout | null = null;
  private colorInterval: NodeJS.Timeout | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.originalTitle = document.title;
      this.originalFavicon = this.getCurrentFavicon();
      this.setupCanvas();
      this.initVisibilityListener();
    }
  }

  private setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 32;
    this.canvas.height = 32;
    this.ctx = this.canvas.getContext('2d');
  }

  private getCurrentFavicon(): string {
    const link = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
    return link?.href || '/favicon.ico';
  }

  private setFavicon(dataUrl: string) {
    let link = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = dataUrl;
  }

  private generateDynamicFavicon(color: string, pulse: boolean = false, notification: number = 0): string {
    if (!this.ctx || !this.canvas) return this.originalFavicon;

    this.ctx.clearRect(0, 0, 32, 32);
    
    // Cyberpunk hexagon base
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = 16 + 12 * Math.cos(angle);
      const y = 16 + 12 * Math.sin(angle);
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Glow effect
    if (pulse) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 8;
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    // Center dot
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(16, 16, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Notification badge
    if (notification > 0) {
      this.ctx.fillStyle = '#ff0066';
      this.ctx.beginPath();
      this.ctx.arc(24, 8, 6, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '8px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(notification > 9 ? '9+' : notification.toString(), 24, 11);
    }

    return this.canvas.toDataURL();
  }

  // Dynamic title with effects
  setTitle(title: string, effect?: 'typing' | 'glitch' | 'pulse') {
    if (effect === 'typing') {
      this.typewriterTitle(title);
    } else if (effect === 'glitch') {
      this.glitchTitle(title);
    } else if (effect === 'pulse') {
      this.pulseTitle(title);
    } else {
      document.title = title;
    }
  }

  private typewriterTitle(fullTitle: string) {
    let i = 0;
    const interval = setInterval(() => {
      document.title = fullTitle.substring(0, i + 1) + (i < fullTitle.length ? '|' : '');
      i++;
      if (i > fullTitle.length + 1) {
        clearInterval(interval);
        document.title = fullTitle;
      }
    }, 100);
  }

  private glitchTitle(title: string) {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let glitchCount = 0;
    const interval = setInterval(() => {
      if (glitchCount < 5) {
        const glitched = title.split('').map(char => 
          Math.random() < 0.3 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
        ).join('');
        document.title = glitched;
        glitchCount++;
      } else {
        document.title = title;
        clearInterval(interval);
      }
    }, 80);
  }

  private pulseTitle(title: string) {
    let count = 0;
    const interval = setInterval(() => {
      document.title = count % 2 === 0 ? `◆ ${title} ◆` : `◇ ${title} ◇`;
      count++;
      if (count > 6) {
        document.title = title;
        clearInterval(interval);
      }
    }, 300);
  }

  // Color cycling favicon
  startColorCycle(colors: string[] = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00']) {
    if (this.colorInterval) clearInterval(this.colorInterval);
    
    let colorIndex = 0;
    this.colorInterval = setInterval(() => {
      const favicon = this.generateDynamicFavicon(colors[colorIndex], true);
      this.setFavicon(favicon);
      colorIndex = (colorIndex + 1) % colors.length;
    }, 1000);
  }

  stopColorCycle() {
    if (this.colorInterval) {
      clearInterval(this.colorInterval);
      this.colorInterval = null;
    }
  }

  // Notification system
  showNotification(count: number, color: string = '#ff0066') {
    const favicon = this.generateDynamicFavicon(color, true, count);
    this.setFavicon(favicon);
    
    // Blink title
    this.startTitleBlink(`(${count}) ${this.originalTitle}`);
  }

  private startTitleBlink(notificationTitle: string) {
    if (this.blinkInterval) clearInterval(this.blinkInterval);
    
    let isOriginal = true;
    this.blinkInterval = setInterval(() => {
      document.title = isOriginal ? notificationTitle : this.originalTitle;
      isOriginal = !isOriginal;
    }, 1000);
  }

  clearNotification() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
    document.title = this.originalTitle;
    this.setFavicon(this.generateDynamicFavicon('#00ffff'));
  }

  // Tab visibility effects
  private initVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setTitle('Come back! 👋', 'pulse');
        this.startColorCycle(['#ff6b6b', '#4ecdc4', '#45b7d1']);
      } else {
        this.stopColorCycle();
        this.clearNotification();
        this.setTitle(this.originalTitle);
      }
    });
  }

  // Page activity indicators
  setActivity(type: 'loading' | 'error' | 'success' | 'warning') {
    const configs = {
      loading: { color: '#ffd700', title: '⚡ Loading...', pulse: true },
      error: { color: '#ff4757', title: '❌ Error', pulse: false },
      success: { color: '#2ed573', title: '✅ Success', pulse: false },
      warning: { color: '#ffa502', title: '⚠️ Warning', pulse: true }
    };
    
    const config = configs[type];
    this.setFavicon(this.generateDynamicFavicon(config.color, config.pulse));
    this.setTitle(config.title, 'glitch');
    
    // Auto-reset after 3 seconds
    setTimeout(() => {
      this.reset();
    }, 3000);
  }

  // Hover simulation (when tab is focused)
  simulateHover() {
    const colors = ['#ff0080', '#0080ff', '#80ff00', '#ff8000'];
    let i = 0;
    const hoverInterval = setInterval(() => {
      this.setFavicon(this.generateDynamicFavicon(colors[i % colors.length], true));
      i++;
      if (i > 8) {
        clearInterval(hoverInterval);
        this.reset();
      }
    }, 200);
  }

  // Reset to original state
  reset() {
    this.stopColorCycle();
    this.clearNotification();
    document.title = this.originalTitle;
    this.setFavicon(this.generateDynamicFavicon('#00ffff'));
  }

  // Advanced: Tab breathing effect
  startBreathing() {
    let intensity = 0;
    const breatheInterval = setInterval(() => {
      const alpha = (Math.sin(intensity) + 1) / 2;
      const color = `rgba(0, 255, 255, ${alpha})`;
      this.setFavicon(this.generateDynamicFavicon(color, true));
      intensity += 0.2;
    }, 100);
    
    // Stop after 10 seconds
    setTimeout(() => clearInterval(breatheInterval), 10000);
  }
}

export const tabEnhancer = new TabEnhancer();