'use client';

import { tabEnhancer } from './tab-enhancer';
import { tabCardEnhancer } from './tab-card-enhancer';

class TabIntegration {
  private isActive: boolean = false;

  start() {
    if (this.isActive) return;
    this.isActive = true;

    // Auto-detect page activities and respond with both systems
    this.setupActivityDetection();
    this.setupNotificationDetection();
    this.setupRouteChangeDetection();
  }

  private setupActivityDetection() {
    // Loading states
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      tabEnhancer.setActivity('loading');
      tabCardEnhancer.setActivity('loading');
      
      try {
        const response = await originalFetch(...args);
        if (response.ok) {
          tabEnhancer.setActivity('success');
          tabCardEnhancer.setActivity('success');
        } else {
          tabEnhancer.setActivity('error');
          tabCardEnhancer.setActivity('error');
        }
        return response;
      } catch (error) {
        tabEnhancer.setActivity('error');
        tabCardEnhancer.setActivity('error');
        throw error;
      }
    };

    // Error detection
    window.addEventListener('error', () => {
      tabEnhancer.setActivity('error');
      tabCardEnhancer.setActivity('error');
    });
  }

  private setupNotificationDetection() {
    // Watch for toast/notification elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.matches('.toast, .notification, [data-sonner-toast]')) {
              tabEnhancer.showNotification(1);
              tabCardEnhancer.flashNotification(2);
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private setupRouteChangeDetection() {
    let currentPath = window.location.pathname;
    
    const checkPathChange = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        
        // Set page-specific colors
        this.setPageTheme(currentPath);
        
        // Show loading then success
        tabEnhancer.setActivity('loading');
        tabCardEnhancer.setActivity('loading');
        
        setTimeout(() => {
          tabEnhancer.setActivity('success');
          tabCardEnhancer.setActivity('success');
        }, 800);
      }
    };

    setInterval(checkPathChange, 100);
    window.addEventListener('popstate', checkPathChange);
  }

  private setPageTheme(path: string) {
    const themes = {
      '/dashboard': '#00ffff',
      '/chat': '#ff00ff',
      '/store': '#ffff00',
      '/earnings': '#00ff00',
      '/notes': '#ff8000',
      '/settings': '#8000ff',
      '/games': '#ff0080',
    };

    const color = themes[path as keyof typeof themes] || '#00ffff';
    tabCardEnhancer.setColor(color);
  }

  stop() {
    this.isActive = false;
  }
}

export const tabIntegration = new TabIntegration();