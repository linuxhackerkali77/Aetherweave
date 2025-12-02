# Real-Time Calling System Documentation

## Overview
A fully functional WebRTC-based calling system with Firebase Realtime Database signaling, featuring Discord-style UI with smooth transitions between call states.

## Architecture

### Technology Stack
- **WebRTC**: Peer-to-peer audio/video communication
- **Firebase Firestore**: Real-time signaling (offers, answers, ICE candidates)
- **React Hooks**: State management
- **Framer Motion**: Smooth animations and transitions

### Components

#### 1. **SenderPanel** (`/src/components/calls/SenderPanel.tsx`)
- Displays when initiating a call
- Shows "Calling..." status with pulsing avatar animation
- Controls: Mute, Video toggle, End call

#### 2. **ReceiverPanel** (`/src/components/calls/ReceiverPanel.tsx`)
- Displays when receiving an incoming call
- Shows caller info with pulsing green animation
- Actions: Accept or Decline

#### 3. **ConnectedPanel** (`/src/components/calls/ConnectedPanel.tsx`)
- Displays during active call
- Shows video streams (remote full-screen, local PiP)
- Displays call duration
- Controls: Mute, Video toggle, End call

#### 4. **CallInterface** (`/src/components/calls/CallInterface.tsx`)
- Main orchestrator component
- Switches between panels based on `callStatus`
- Handles smooth transitions with AnimatePresence

### Hook: `useEnhancedCalls`

Located at `/src/hooks/use-enhanced-calls.ts`

#### Call States
```typescript
type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected';
```

#### Key Functions
- `startCall(userId, userName, callType, avatar?)` - Initiate a call
- `acceptCall()` - Accept incoming call
- `declineCall()` - Decline incoming call
- `endCall()` - End active call
- `toggleAudio()` - Mute/unmute microphone
- `toggleVideo()` - Enable/disable camera

#### State Variables
- `callStatus` - Current call state
- `activeCall` - Active call details
- `incomingCall` - Incoming call details
- `localStream` - Local media stream
- `remoteStream` - Remote media stream
- `isAudioEnabled` - Microphone state
- `isVideoEnabled` - Camera state
- `callDuration` - Formatted call duration (MM:SS)

## Firebase Structure

### Collections

#### `/calls/{userId}`
Stores call signaling data for each user:
```typescript
{
  type: 'incoming' | 'accepted' | 'declined' | 'ended',
  callId: string,
  fromUserId: string,
  fromUserName: string,
  fromUserAvatar?: string,
  callType: 'voice' | 'video',
  timestamp: Timestamp
}
```

#### `/webrtc/{callId}`
Stores WebRTC signaling data:
```typescript
{
  offer: RTCSessionDescriptionInit,
  answer?: RTCSessionDescriptionInit,
  timestamp: Timestamp
}
```

#### `/webrtc/{callId}/candidates`
Stores ICE candidates for connection establishment:
```typescript
{
  candidate: RTCIceCandidateInit,
  timestamp: Timestamp
}
```

## Call Flow

### Initiating a Call (Sender)
1. User clicks call button → `startCall()` called
2. Status changes to `'calling'` → **SenderPanel** displays
3. Get user media (audio/video)
4. Create RTCPeerConnection
5. Create and send offer to Firestore `/webrtc/{callId}`
6. Send call notification to recipient `/calls/{recipientId}`
7. Listen for answer from Firestore

### Receiving a Call (Receiver)
1. Firestore listener detects incoming call
2. Status changes to `'ringing'` → **ReceiverPanel** displays
3. Ringtone plays
4. User clicks Accept → `acceptCall()` called
5. Get user media
6. Create RTCPeerConnection
7. Retrieve offer from Firestore
8. Create and send answer to Firestore
9. Notify caller of acceptance

### Connected State
1. Both peers exchange ICE candidates
2. WebRTC connection established
3. Status changes to `'connected'` → **ConnectedPanel** displays
4. Call timer starts
5. Video/audio streams displayed

### Ending a Call
1. User clicks end call → `endCall()` called
2. Stop all media tracks
3. Close peer connection
4. Notify other user via Firestore
5. Clean up Firestore documents
6. Status returns to `'idle'`

## Usage Example

```tsx
import { useEnhancedCalls } from '@/hooks/use-enhanced-calls';

function MyComponent() {
  const { startCall, callStatus } = useEnhancedCalls();

  const handleCall = () => {
    startCall(
      'user123',           // userId
      'John Doe',          // userName
      'video',             // 'voice' | 'video'
      '/avatar.jpg'        // optional avatar URL
    );
  };

  return (
    <button onClick={handleCall}>
      Start Video Call
    </button>
  );
}
```

## Testing

Visit `/calls-test` page to test the calling system with your connections.

## Features

✅ Voice and video calls
✅ Real-time signaling via Firebase
✅ Discord-style UI with smooth transitions
✅ Call duration tracking
✅ Mute/unmute audio
✅ Enable/disable video
✅ Picture-in-picture local video
✅ Ringtone playback
✅ Accept/decline incoming calls
✅ Automatic cleanup on page refresh

## Security Considerations

- Firebase Security Rules should restrict read/write access to call documents
- Only participants should access their call data
- ICE candidates should be protected from unauthorized access

## Future Enhancements

- Screen sharing
- Group calls
- Call history
- Recording
- Noise cancellation
- Virtual backgrounds
- Call quality indicators
