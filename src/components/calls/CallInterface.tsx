'use client';

import { AnimatePresence } from 'framer-motion';
import { useCall } from '@/contexts/CallContext';
import SenderPanel from './SenderPanel';
import ReceiverPanel from './ReceiverPanel';
import ConnectedPanel from './ConnectedPanel';

export default function CallInterface() {
  const {
    callStatus,
    activeCall,
    incomingCall,
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isMinimized,
    callDuration,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    setIsMinimized
  } = useCall();



  return (
    <AnimatePresence mode="wait">
      {callStatus === 'calling' && activeCall && (
        <SenderPanel
          key="sender"
          callerName={activeCall.withUserName}
          callerAvatar={activeCall.withUserAvatar}
          onEndCall={endCall}
        />
      )}

      {callStatus === 'ringing' && incomingCall && (
        <ReceiverPanel
          key="receiver"
          callerName={incomingCall.fromUserName}
          callerAvatar={incomingCall.fromUserAvatar}
          callType={incomingCall.callType}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}

      {callStatus === 'connected' && activeCall && (
        <ConnectedPanel
          key="connected"
          callerName={activeCall.withUserName}
          callerAvatar={activeCall.withUserAvatar}
          callType={activeCall.callType}
          duration={callDuration}
          localStream={localStream}
          remoteStream={remoteStream}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          isMinimized={isMinimized}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onMinimize={() => setIsMinimized(!isMinimized)}
          onEndCall={endCall}
        />
      )}
    </AnimatePresence>
  );
}