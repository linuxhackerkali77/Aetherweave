
'use client';
import { motion } from 'framer-motion';

export default function LoadingBar({ progress }: { progress: number }) {
  return (
    <div className="absolute bottom-1/4 w-1/3 max-w-sm flex flex-col items-center gap-4">
        <p className="font-mono text-primary text-glow tracking-widest">
            AETHERWEAVE OS
        </p>
        <div className="w-full h-2 bg-primary/10 border-2 border-primary/20 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-primary neon-glow-primary rounded-full"
                style={{
                    boxShadow: `0 0 15px hsl(var(--primary))`,
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
        </div>
         <p className="font-mono text-sm text-muted-foreground">
            Initializing modules... {Math.round(progress)}%
        </p>
    </div>
  );
}
