'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, MessageCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = sessionStorage.getItem('betaBannerDismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('betaBannerDismissed', 'true');
  };

  if (!mounted || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-[100] bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-b border-amber-500/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(var(--primary)/0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
          
          <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-amber-200">
                  <span className="font-bold">BETA VERSION</span>
                  <span className="hidden sm:inline"> - Found a bug? Report it!</span>
                </span>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4">
                <a
                  href="https://wa.me/9203122574283"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="font-mono">03122574283</span>
                </a>
                
                <a
                  href="mailto:aetherweavedash@gmail.com"
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-mono">aetherweavedash@gmail.com</span>
                  <span className="sm:hidden font-mono">Email</span>
                </a>
              </div>

              <button
                onClick={handleDismiss}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-amber-400/70 hover:text-amber-300 transition-colors rounded-lg hover:bg-amber-500/10"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
