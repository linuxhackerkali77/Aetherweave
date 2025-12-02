'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff, MonitorUp, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ConnectedPanelProps {
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  duration: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isMinimized: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onMinimize: () => void;
  onEndCall: () => void;
}

export default function ConnectedPanel({
  callerName,
  callerAvatar,
  callType,
  duration,
  localStream,
  remoteStream,
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isMinimized,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onMinimize,
  onEndCall
}: ConnectedPanelProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX - position.x, startY: e.clientY - position.y };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY });
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ left: position.x, top: position.y }}
        className="fixed z-[9999] w-80 glass-card border-2 border-primary/30 shadow-2xl"
      >
        <div
          onMouseDown={handleMouseDown}
          className="p-3 bg-background/90 backdrop-blur-md border-b border-primary/20 flex items-center justify-between cursor-move"
        >
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 border border-green-500">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback>{callerName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold">{callerName}</p>
              <p className="text-xs text-green-500 font-mono">{duration}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onMinimize} className="h-8 w-8">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-3 flex items-center justify-center gap-2">
          <Button variant={isAudioEnabled ? "default" : "destructive"} size="icon" onClick={onToggleAudio} className="h-10 w-10 rounded-full">
            {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          {callType === 'video' && (
            <Button variant={isVideoEnabled ? "default" : "destructive"} size="icon" onClick={onToggleVideo} className="h-10 w-10 rounded-full">
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
          )}
          <Button variant="destructive" size="icon" onClick={onEndCall} className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600">
            <PhoneOff className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-background via-background to-primary/5 flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between p-4 md:p-6 bg-background/90 backdrop-blur-md border-b border-primary/20 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-green-500">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback>{callerName[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{callerName}</h3>
            <p className="text-sm text-green-500 font-mono">{duration}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onMinimize} title="Minimize">
          <Minimize2 className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Video/Audio Area */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {callType === 'video' ? (
          <>
            {remoteStream ? (
              <motion.video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-background">
                <div className="text-center space-y-4">
                  <Avatar className="w-32 h-32 mx-auto border-4 border-primary/30">
                    <AvatarImage src={callerAvatar} />
                    <AvatarFallback className="text-4xl">{callerName[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground">Waiting for video...</p>
                </div>
              </div>
            )}
            {localStream && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-4 right-4 w-48 h-36 bg-black rounded-xl overflow-hidden border-2 border-primary/50 shadow-2xl"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-background">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Avatar className="w-48 h-48 border-4 border-primary shadow-2xl">
                <AvatarImage src={callerAvatar} />
                <AvatarFallback className="text-6xl">{callerName[0]}</AvatarFallback>
              </Avatar>
            </motion.div>
            <audio ref={remoteAudioRef} autoPlay />
          </div>
        )}
      </div>

      {/* Controls */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-6 md:p-8 bg-background/90 backdrop-blur-md border-t border-primary/20 shadow-lg"
      >
        <div className="flex items-center justify-center gap-3 md:gap-4">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="icon"
            onClick={onToggleAudio}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5 md:w-6 md:h-6" /> : <MicOff className="w-5 h-5 md:w-6 md:h-6" />}
          </Button>

          {callType === 'video' && (
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="icon"
              onClick={onToggleVideo}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
            >
              {isVideoEnabled ? <Video className="w-5 h-5 md:w-6 md:h-6" /> : <VideoOff className="w-5 h-5 md:w-6 md:h-6" />}
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            disabled
            className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            title="Screen Share (Coming Soon)"
          >
            <MonitorUp className="w-5 h-5 md:w-6 md:h-6" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={onEndCall}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
