
'use client';

import { useCommandHub, CommandHubAction } from '@/hooks/use-command-hub';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import * as Lucide from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCursor } from '@/hooks/use-cursor';
import { appEventEmitter } from '@/lib/event-emitter';

export default function CommandHub() {
  const { isOpen, position, actions, closeHub, data, loadingAction } = useCommandHub();
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const { setCursorMode } = useCursor();
  
  useEffect(() => {
    if (isOpen) {
      const menu = menuRef.current;
      if (!menu) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      
      // Use getBoundingClientRect after the menu is visible for accurate dimensions
      const rect = menu.getBoundingClientRect();
      
      let x = position.x;
      let y = position.y;
      
      // Adjust if it overflows the screen
      if (x + rect.width > screenW) x = screenW - rect.width - 16;
      if (y + rect.height > screenH) y = screenH - rect.height - 16;
      if (x < 16) x = 16;
      if (y < 16) y = 16;

      setAdjustedPosition({ x, y });
    }
  }, [isOpen, position]);


  const handleActionClick = async (action: CommandHubAction, event: React.MouseEvent<HTMLButtonElement>) => {
    appEventEmitter.emit('ui:sound', 'click');
    if (!action.disabled && !loadingAction) {
      await action.onClick(data);
      closeHub();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeHub();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998]" onClick={handleBackdropClick}>
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-[9999] w-[260px] max-h-[320px] rounded-xl glass-card neon-border-primary overflow-hidden"
            style={{
              left: adjustedPosition.x,
              top: adjustedPosition.y,
            }}
            role="menu"
            aria-label="Context Menu"
          >
            <div className="overflow-y-auto max-h-[320px] custom-scroll p-1.5">
              {actions.map((action, index) => {
                if (action.separator) {
                  return <div key={index} className="h-px bg-border my-1" />;
                }
                
                const Icon = action.icon ? (Lucide[action.icon] as Lucide.LucideIcon) : Lucide.Circle;
                return (
                  <button
                    key={index}
                    role="menuitem"
                    disabled={action.disabled || loadingAction === action.label}
                    onClick={(e) => handleActionClick(action, e)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 rounded-md transition-colors",
                      "hover:bg-primary/20",
                      action.isDestructive ? 'text-destructive hover:bg-destructive/20' : 'text-foreground',
                      (action.disabled || loadingAction) && 'opacity-50 grayscale pointer-events-none',
                      loadingAction === action.label && 'bg-primary/10'
                    )}
                    onMouseEnter={() => setCursorMode('link')}
                    onMouseLeave={() => setCursorMode('default')}
                  >
                    {loadingAction === action.label ? (
                      <Lucide.Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                    ) : (
                      Icon && <Icon className="w-4 h-4 shrink-0" />
                    )}
                    <span className="truncate flex-1">{action.label}</span>
                    {loadingAction === action.label && (
                      <Lucide.Loader2 className="w-3 h-3 animate-spin opacity-60" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
