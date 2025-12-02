'use client';

import { tabEnhancer } from './tab-enhancer';

class TabAutoEnhancer {
  private observers: MutationObserver[] = [];
  private isActive: boolean = false;

  start() {
    if (this.isActive) return;
    this.isActive = true;

    // Auto-detect form submissions
    this.observeFormSubmissions();
    
    // Auto-detect AJAX requests
    this.observeNetworkActivity();
    
    // Auto-detect errors
    this.observeErrors();
    
    // Auto-detect notifications
    this.observeNotifications();
    
    // Auto-detect page changes
    this.observePageChanges();
  }

  private observeFormSubmissions() {
    document.addEventListener('submit', () => {
      tabEnhancer.setActivity('loading');
    });
  }

  private observeNetworkActivity() {
    // Override fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      tabEnhancer.setActivity('loading');
      try {
        const response = await originalFetch(...args);
        if (response.ok) {
          tabEnhancer.setActivity('success');
        } else {
          tabEnhancer.setActivity('error');
        }
        return response;
      } catch (error) {
        tabEnhancer.setActivity('error');
        throw error;
      }
    };

    // Override XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const originalSend = xhr.send;
      
      xhr.send = function(...args) {
        tabEnhancer.setActivity('loading');
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            tabEnhancer.setActivity('success');
          } else {
            tabEnhancer.setActivity('error');
          }
        });
        
        xhr.addEventListener('error', () => {
          tabEnhancer.setActivity('error');
        });
        
        return originalSend.apply(this, args);
      };
      
      return xhr;
    };
  }

  private observeErrors() {
    window.addEventListener('error', () => {
      tabEnhancer.setActivity('error');
    });

    window.addEventListener('unhandledrejection', () => {
      tabEnhancer.setActivity('error');
    });
  }

  private observeNotifications() {
    // Watch for notification elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.matches('.toast, .notification, .alert, [role="alert"]')) {
              tabEnhancer.showNotification(1);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.push(observer);
  }

  private observePageChanges() {
    // Watch for route changes in SPAs
    let currentPath = window.location.pathname;
    
    const checkPathChange = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        tabEnhancer.setActivity('loading');
        
        // Simulate page load completion
        setTimeout(() => {
          tabEnhancer.setActivity('success');
        }, 1000);
      }
    };

    // Check for path changes
    setInterval(checkPathChange, 100);

    // Listen for popstate (back/forward)
    window.addEventListener('popstate', checkPathChange);
  }

  stop() {
    this.isActive = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const tabAutoEnhancer = new TabAutoEnhancer();