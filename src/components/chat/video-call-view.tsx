
'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, ScreenShareOff, User, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PublicUser } from '@/hooks/use-connections';
import { cn } from '@/lib/utils';
import { CallStatus } from '@/hooks/use-webrtc';
import { useUser } from '@/hooks/use-user';
import { useAudioLevel } from '@/hooks/use-audio-level';

interface VideoParticipantProps {
  stream: MediaStream | null;
  user: PublicUser | undefined;
  isLocal?: boolean;
  isMuted: boolean;
}

const VideoParticipant = ({ stream, user, isLocal = false, isMuted }: VideoParticipantProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioLevel = useAudioLevel(stream);
    const isTalking = audioLevel > 0.05;

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className={cn("w-full h-full object-cover", isLocal && "scale-x-[-1]")}
                />
            ) : (
                <Avatar className="w-24 h-24 border-4 border-muted">
                    <AvatarImage src={user?.photoURL || ''} />
                    <AvatarFallback className="text-4xl">{user?.displayName?.[0] || '?'}</AvatarFallback>
                </Avatar>
            )}
             <div className={cn(
                "absolute inset-0 border-4 rounded-lg transition-all duration-300 pointer-events-none",
                isTalking ? 'border-primary neon-border-primary' : 'border-transparent'
            )}></div>
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-white text-sm flex items-center gap-2">
                {isMuted ? <MicOff className="w-4 h-4 text-destructive" /> : <Mic className="w-4 h-4" />}
                {user?.displayName}
            </div>
        </div>
    );
};


interface VideoCallViewProps {
  state: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onHangup: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  duration: string;
  peer?: PublicUser;
  status: string;
  onScreenShare: () => void;
  isScreenSharing: boolean;
}

export default function VideoCallView({
  state, localStream, remoteStream, onHangup, onToggleAudio, onToggleVideo, isAudioEnabled,
  isVideoEnabled, duration, peer, status, onScreenShare, isScreenSharing
}: VideoCallViewProps) {
  const { profile: currentUser } = useUser();

  const renderContent = () => {
    if (state === 'connected') {
      return (
        <div className="grid grid-cols-1 grid-rows-1 h-full w-full">
            <div className="col-span-1 row-span-1">
                <VideoParticipant stream={remoteStream} user={peer} isMuted={false} />
            </div>
            <div className="absolute bottom-4 right-4 w-40 md:w-52 z-10">
                 <VideoParticipant stream={localStream} user={currentUser || undefined} isLocal isMuted={!isAudioEnabled}/>
            </div>
        </div>
      );
    }
    
    // For outgoing, ringing, or connecting states
    const statusText = state === 'calling' ? 'Calling...' : state === 'ringing' ? 'Ringing...' : status;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 text-white">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-primary">
            <AvatarImage src={peer?.photoURL || ''} />
            <AvatarFallback className="text-5xl">{peer?.displayName?.[0] || '?'}</AvatarFallback>
          </Avatar>
           {(state === 'calling' || state === 'ringing') && <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping"></div>}
        </div>
        <h3 className="mt-6 text-3xl font-headline text-glow">{peer?.displayName || 'Connecting...'}</h3>
        <p className="text-muted-foreground capitalize flex items-center gap-2 mt-2">
           {(state === 'calling' || status === 'connecting') && <Loader2 className="w-5 h-5 animate-spin"/>}
            {statusText}
        </p>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-0 md:p-4">
      <Card className="w-full h-full max-w-none md:max-w-6xl md:max-h-[90vh] glass-card flex flex-col overflow-hidden rounded-none md:rounded-lg">
        <CardContent className="flex-1 p-0 relative">
          {renderContent()}
        </CardContent>

        <div className="p-4 border-t bg-background/50 backdrop-blur-sm flex justify-center items-center gap-4">
          <Button variant={isAudioEnabled ? 'outline' : 'secondary'} size="icon" className="w-12 h-12 rounded-full" onClick={onToggleAudio}>
            {isAudioEnabled ? <Mic /> : <MicOff className="text-destructive"/>}
          </Button>
          <Button variant={isVideoEnabled ? 'outline' : 'secondary'} size="icon" className="w-12 h-12 rounded-full" onClick={onToggleVideo}>
            {isVideoEnabled ? <Video /> : <VideoOff className="text-destructive"/>}
          </Button>
           <Button variant={isScreenSharing ? 'secondary' : 'outline'} size="icon" className="w-12 h-12 rounded-full" onClick={onScreenShare}>
            {isScreenSharing ? <ScreenShareOff className="text-destructive"/> : <ScreenShare />}
          </Button>
          <Button size="icon" className="w-16 h-12 rounded-full bg-destructive hover:bg-destructive/80" onClick={onHangup}>
            <PhoneOff />
          </Button>
        </div>
      </Card>
    </div>
  );
}
