'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useUser } from './use-user';
import { useToast } from './use-toast';
import { getSocket } from '@/lib/socket';

export type CallType = 'voice' | 'video';
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected';

export interface IncomingCall {
  callId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  callType: CallType;
  timestamp: number;
}

export interface ActiveCall {
  callId: string;
  withUserId: string;
  withUserName: string;
  withUserAvatar?: string;
  callType: CallType;
  isInitiator: boolean;
}

export const useEnhancedCalls = () => {
  const { user, profile } = useUser();
  const { toast } = useToast();
  const socket = getSocket();

  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);


  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const activeCallRef = useRef<ActiveCall | null>(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    if (!user) return;
    
    socket.connect();
    socket.emit('user:register', user.uid);

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:answer', handleAnswer);
    socket.on('call:ice-candidate', handleIceCandidate);
    socket.on('call:ended', cleanup);
    socket.on('call:declined', () => {
      toast({ variant: 'destructive', title: 'Call Declined' });
      cleanup();
    });

    return () => {
      socket.off('call:incoming');
      socket.off('call:answer');
      socket.off('call:ice-candidate');
      socket.off('call:ended');
      socket.off('call:declined');
      socket.disconnect();
      stopRingtone();
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (localStream) localStream.getTracks().forEach(t => t.stop());
      if (peerConnectionRef.current) peerConnectionRef.current.close();
    };
  }, [user]);

  const playRingtone = useCallback(() => {
    try {
      if (!ringtoneRef.current) {
        ringtoneRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe77OeeSwwPUKfj8LZjHAU5kdfy0HotBSJ1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/y24k2CBdmvOznnUoMDlCn4/C2YxwFOZHX8tB6LQUidb/v4JRCCxJcr+jrq1gVCEOc3fLBbiQFLoTP8tuJNggXZrzs551KDA5Qp+PwtmMcBTmR1/LQei0FInW/7+CUQgsRXK/o66tYFQhDnN3ywW4kBS6Ez/LbiTYIF2a87OedSgwOUKfj8LZjHAU5kdfyz3otBSJ1v+/glEILEVyv6OurWBUIQ5zd8sFuJAUuhM/y24k2CBdmvOznnUoMDlCn4/C2YxwFOZHX8s96LQUidb/v4JRCCxFcr+jrq1gVCEOc3fLBbiQFLoTP8tuJNggXZrzs551KDA5Qp+PwtmMcBTmR1/LPei0FInW/7+CUQgsRXK/o66tYFQhDnN3ywW4kBS6Ez/LbiTYIF2a87OedSgwOUKfj8LZjHAU5kdfyz3otBSJ1v+/glEILEVyv6OurWBUIQ5zd8sFuJAUuhM/y24k2CBdmvOznnUoMDlCn4/C2YxwFOZHX8s96LQUidb/v4JRCCxFcr+jrq1gVCEOc3fLBbiQFLoTP8tuJNggXZrzs551KDA5Qp+PwtmMcBTmR1/LPei0FInW/7+CUQgsRXK/o66tYFQhDnN3ywW4kBS6Ez/LbiTYIF2a87OedSgwOUKfj8LZjHAU5kdfyz3otBSJ1v+/glEILEVyv6OurWBUIQ5zd8sFuJAUuhM/y24k2CBdmvOznnUoMDlCn4/C2YxwFOZHX8s96LQUidb/v4JRCCxFcr+jrq1gVCEOc3fLBbiQFLoTP8tuJNggXZrzs551KDA5Qp+PwtmMcBTmR1/LPei0FInW/7+CUQgsRXK/o66tYFQhDnN3ywW4kBS6Ez/LbiTYIF2a87OedSgwNU=');
        ringtoneRef.current.loop = true;
        ringtoneRef.current.volume = 0.5;
      }
      ringtoneRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, []);

  const startCallTimer = useCallback(() => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const cleanup = useCallback(() => {
    stopRingtone();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
    setCallDuration(0);
    setCallStatus('idle');
    peerConnectionRef.current = null;
    callTimerRef.current = null;
  }, [localStream, stopRingtone]);

  const createPeerConnection = useCallback((remoteUserId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.ontrack = (e) => setRemoteStream(e.streams[0]);
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('call:ice-candidate', {
          to: remoteUserId,
          candidate: e.candidate.toJSON()
        });
      }
    };

    return pc;
  }, [socket]);

  const handleIncomingCall = useCallback(({ from, offer, callType, fromName, fromAvatar }: any) => {
    setIncomingCall({
      callId: `${Date.now()}_${from}`,
      fromUserId: from,
      fromUserName: fromName,
      fromUserAvatar: fromAvatar,
      callType,
      timestamp: Date.now()
    });
    setCallStatus('ringing');
    playRingtone();
    
    peerConnectionRef.current = createPeerConnection(from);
    peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
  }, [playRingtone, createPeerConnection]);

  const handleAnswer = useCallback(async ({ answer }: any) => {
    if (peerConnectionRef.current && peerConnectionRef.current.signalingState === 'have-local-offer') {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      stopRingtone();
      setCallStatus('connected');
      startCallTimer();
    }
  }, [startCallTimer, stopRingtone]);

  const handleIceCandidate = useCallback(({ candidate }: any) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  const startCall = useCallback(async (
    toUserId: string, 
    toUserName: string, 
    callType: CallType,
    toUserAvatar?: string
  ) => {
    if (!user) return;

    try {
      const callId = `${Date.now()}_${user.uid}`;
      setCallStatus('calling');
      setActiveCall({
        callId,
        withUserId: toUserId,
        withUserName: toUserName,
        withUserAvatar: toUserAvatar,
        callType,
        isInitiator: true
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video'
      });
      setLocalStream(stream);

      const pc = createPeerConnection(toUserId);
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      peerConnectionRef.current = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call:offer', {
        to: toUserId,
        from: user.uid,
        offer,
        callType,
        fromName: profile?.displayName || 'Unknown',
        fromAvatar: profile?.photoURL
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Call Failed', description: error.message });
      cleanup();
    }
  }, [user, profile, socket, createPeerConnection, toast, cleanup]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !user) return;

    stopRingtone();
    const callData = { ...incomingCall };
    setIncomingCall(null);
    setActiveCall({
      callId: callData.callId,
      withUserId: callData.fromUserId,
      withUserName: callData.fromUserName,
      withUserAvatar: callData.fromUserAvatar,
      callType: callData.callType,
      isInitiator: false
    });
    setCallStatus('connected');
    startCallTimer();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callData.callType === 'video'
      });
      setLocalStream(stream);

      if (peerConnectionRef.current) {
        stream.getTracks().forEach(t => peerConnectionRef.current!.addTrack(t, stream));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socket.emit('call:answer', {
          to: callData.fromUserId,
          answer
        });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Call Failed', description: error.message });
    }
  }, [incomingCall, user, socket, stopRingtone, toast, startCallTimer]);

  const declineCall = useCallback(() => {
    if (!incomingCall) return;

    stopRingtone();
    socket.emit('call:decline', { to: incomingCall.fromUserId });
    setIncomingCall(null);
    setCallStatus('idle');
  }, [incomingCall, socket, stopRingtone]);

  const endCall = useCallback(() => {
    if (activeCall) {
      socket.emit('call:end', { to: activeCall.withUserId });
    }
    cleanup();
  }, [activeCall, socket, cleanup]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsAudioEnabled(track.enabled);
      });
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoEnabled(track.enabled);
      });
    }
  }, [localStream]);

  const toggleScreenShare = useCallback(async () => {
    if (!peerConnectionRef.current || !activeCall) return;

    try {
      if (isScreenSharing) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: activeCall.callType === 'video'
        });
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
        if (localStream) {
          localStream.getVideoTracks().forEach(t => t.stop());
        }
        setLocalStream(stream);
        setIsScreenSharing(false);
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
        screenTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Screen Share Failed', description: error.message });
    }
  }, [isScreenSharing, activeCall, localStream, toast]);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    callStatus,
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isMinimized,
    callDuration: formatCallDuration(callDuration),
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    setIsMinimized
  };
};