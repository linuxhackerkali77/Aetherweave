'use client';
import { useState } from 'react';
import { Phone, Mic, MicOff, Video, VideoOff, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MinimizedCallPanelProps {
  onMaximize: () => void;
  onEndCall: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  callerName: string;
  callerAvatar?: string;
  duration: string;
}

export default function MinimizedCallPanel({
  onMaximize,
  onEndCall,
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  callerName,
  callerAvatar,
  duration
}: MinimizedCallPanelProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        setPosition({ x: info.point.x, y: info.point.y });
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className="fixed z-[9999] cursor-move"
      style={{ x: position.x, y: position.y }}
    >
      <div className="relative">
        {/* Main Dot */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/50 flex items-center justify-center border-2 border-primary/30 animate-pulse">
          {callerAvatar ? (
            <img src={callerAvatar} alt={callerName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <Phone className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Duration Badge */}
        <div className="absolute -top-2 -right-2 bg-background/90 backdrop-blur-sm border border-primary/30 rounded-full px-2 py-0.5 text-[10px] font-mono text-primary">
          {duration}
        </div>

        {/* Controls Panel */}
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-md border border-primary/30 rounded-xl p-2 shadow-xl flex gap-1"
          >
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-primary" />}
            </button>
            <button
              onClick={onToggleVideo}
              className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
              title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4 text-primary" />}
            </button>
            <button
              onClick={onMaximize}
              className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
              title="Maximize"
            >
              <Maximize2 className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={onEndCall}
              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
              title="End call"
            >
              <Phone className="w-4 h-4 text-red-400 rotate-[135deg]" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
