'use client';

import { motion } from 'framer-motion';
import { Phone, PhoneOff, Video, PhoneIncoming } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ReceiverPanelProps {
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

export default function ReceiverPanel({
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline
}: ReceiverPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -20 }}
        transition={{ type: 'spring', damping: 20 }}
        className="glass-card p-8 rounded-3xl border-2 border-green-500/30 shadow-2xl max-w-sm w-full incoming-call-animation"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Avatar className="w-28 h-28 border-4 border-green-500 shadow-xl">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="text-4xl bg-green-500/10">{callerName[0]}</AvatarFallback>
            </Avatar>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-500"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-400"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg"
            >
              <PhoneIncoming className="w-5 h-5 text-white" />
            </motion.div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-glow">{callerName}</h2>
            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-green-400 flex items-center gap-2 justify-center font-medium"
            >
              {callType === 'video' ? (
                <><Video className="w-4 h-4" /> Incoming Video Call</>
              ) : (
                <><Phone className="w-4 h-4" /> Incoming Voice Call</>
              )}
            </motion.p>
          </div>

          <div className="flex items-center gap-4 w-full">
            <Button
              onClick={onDecline}
              size="lg"
              className="flex-1 h-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all text-base font-semibold"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              Decline
            </Button>
            <Button
              onClick={onAccept}
              size="lg"
              className="flex-1 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all text-base font-semibold"
            >
              <Phone className="w-5 h-5 mr-2" />
              Accept
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
