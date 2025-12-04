
'use client';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useMemo } from 'react';

interface TutorialPopupProps {
  x: number;
  y: number;
  content: {
    title: string;
    description: string;
    icon: keyof typeof Lucide;
  };
}

export default function TutorialPopup({ x, y, content }: TutorialPopupProps) {
  const Icon = useMemo(() => (Lucide[content.icon] as any) || Lucide.Info, [content.icon]) as React.ComponentType<{ className?: string }>;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8, x, y }}
      animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
      className="absolute p-4 w-[220px] h-[100px] glass-card neon-border-primary cursor-grab active:cursor-grabbing"
      style={{
        boxShadow: '0 0 20px hsl(var(--primary) / 0.5)',
      }}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">{content.title}</h4>
          <p className="text-xs text-muted-foreground">{content.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
