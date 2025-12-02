'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

interface SenderPanelProps {
  callerName: string;
  callerAvatar?: string;
  onEndCall: () => void;
}

export default function SenderPanel({ callerName, callerAvatar, onEndCall }: SenderPanelProps) {
  const [status, setStatus] = useState<'calling' | 'ringing' | 'connecting'>('calling');

  useEffect(() => {
    const timer1 = setTimeout(() => setStatus('ringing'), 1000);
    const timer2 = setTimeout(() => setStatus('connecting'), 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-background via-background/95 to-primary/5 backdrop-blur-xl flex items-center justify-center"
    >
      <div className="glass-card p-12 rounded-3xl border-2 border-primary/20 shadow-2xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-xl">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="text-5xl bg-primary/10">{callerName[0]}</AvatarFallback>
            </Avatar>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-glow">{callerName}</h2>
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-lg"
            >
              {status === 'connecting' && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              <p className="text-muted-foreground">
                {status === 'calling' && 'Calling...'}
                {status === 'ringing' && 'Ringing...'}
                {status === 'connecting' && 'Connecting...'}
              </p>
            </motion.div>
          </div>

          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all"
          />
        </div>
      </div>
    </motion.div>
  );
}
