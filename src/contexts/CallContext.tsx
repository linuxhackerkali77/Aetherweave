'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useEnhancedCalls } from '@/hooks/use-enhanced-calls';
import type { CallStatus, CallType, IncomingCall, ActiveCall } from '@/hooks/use-enhanced-calls';

interface CallContextType {
  callStatus: CallStatus;
  incomingCall: IncomingCall | null;
  activeCall: ActiveCall | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isMinimized: boolean;
  callDuration: string;
  startCall: (toUserId: string, toUserName: string, callType: CallType, toUserAvatar?: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  setIsMinimized: (value: boolean) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const callState = useEnhancedCalls();
  return <CallContext.Provider value={callState}>{children}</CallContext.Provider>;
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within CallProvider');
  return context;
}
