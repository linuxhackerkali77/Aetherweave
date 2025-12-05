'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useCallSounds } from './use-call-sounds';
import { useToast } from './use-toast';
import { UserProfile, useUser } from './use-user';
import { PublicUser } from './use-connections';
import { createCallSession } from '@/ai/flows/create-call-session-flow';
import { collection, doc, onSnapshot, addDoc, serverTimestamp, setDoc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAuth } from '@/firebase/provider';


export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'declined';

interface SignalingDoc {
    type: 'offer' | 'answer' | 'ice-candidate';
    senderId: string;
    payload: any;
    timestamp: any;
}

export const useWebRTC = (currentUser: UserProfile | null) => {
  const firestore = useFirestore();
  const auth = useAuth();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const [incomingCall, setIncomingCall] = useState<{
    fromUserId: string;
    fromUserName: string;
    sessionId: string;
  } | null>(null);
  
  const [activeCall, setActiveCall] = useState<{
    withUser: PublicUser;
    sessionId: string;
    isInitiator: boolean;
  } | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { playRingtone, playCallEndedSound, stopRingtone } = useCallSounds();
  const { toast } = useToast();

  const signalingCollectionRef = useMemo(() => {
    if (!firestore || !currentUser || !activeCall) return null;
    return collection(firestore, 'users', currentUser.id, 'signaling', activeCall.withUser.id, 'messages');
  }, [firestore, currentUser, activeCall]);

  const remoteSignalingCollectionRef = useMemo(() => {
    if (!firestore || !currentUser || !activeCall) return null;
    return collection(firestore, 'users', activeCall.withUser.id, 'signaling', currentUser.id, 'messages');
  }, [firestore, currentUser, activeCall]);

  const cleanupCall = useCallback((status: CallStatus = 'idle') => {
    console.log('Cleaning up call...');
    if (ringtoneIntervalRef.current) {
      stopRingtone(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallDuration(0);
    setIncomingCall(null);
    setActiveCall(null);
    setIsScreenSharing(false);
    setCallStatus(status);
    setTimeout(() => {
      if (status !== 'ringing') {
        setCallStatus('idle');
      }
    }, 2000);
  }, [localStream, stopRingtone]);

  const endCall = useCallback(async () => {
    playCallEndedSound();
    if (activeCall && firestore && currentUser) {
      try {
        await setDoc(doc(firestore, 'users', activeCall.withUser.id, 'signaling', currentUser.id), {
            type: 'end-call'
        }, { merge: true });
      } catch (e) {
          console.error("Error sending end-call signal:", e);
      }
    }
    cleanupCall('ended');
  }, [activeCall, currentUser, firestore, cleanupCall, playCallEndedSound]);

  // Listen for incoming signaling documents
  useEffect(() => {
    if (!firestore || !currentUser) return;
    const userSignalingRef = doc(firestore, 'users', currentUser.id);
    
    // This is a simplified listener. A more robust solution might use a subcollection.
    const unsubscribe = onSnapshot(collection(firestore, userSignalingRef.path, 'signaling'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
                const data = change.doc.data();
                const fromUserId = change.doc.id;
                console.log(`Received signal from ${fromUserId}:`, data.type);

                if (data.type === 'offer' && callStatus === 'idle') {
                    setIncomingCall({
                        fromUserId: fromUserId,
                        fromUserName: data.fromUserName || 'Unknown Caller',
                        sessionId: data.sessionId,
                    });
                    setCallStatus('ringing');
                    const intervalId = playRingtone();
                    ringtoneIntervalRef.current = intervalId;
                }
                 if (data.type === 'end-call' && activeCall?.withUser.id === fromUserId) {
                     toast({ title: 'Call Ended' });
                     cleanupCall('ended');
                 }
            }
        });
    });

    return () => unsubscribe();
}, [firestore, currentUser, callStatus, activeCall, cleanupCall, playRingtone, toast]);


// Listen for messages within an active call
useEffect(() => {
  if (!signalingCollectionRef || !peerConnectionRef.current || !currentUser) return;
  
  const pc = peerConnectionRef.current;

  const unsubscribe = onSnapshot(signalingCollectionRef, async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type === 'added') {
        const data = change.doc.data() as SignalingDoc;
        console.log("Received signaling message:", data.type);
        if (data.senderId === currentUser?.id) continue;

        try {
            if (data.type === 'answer') {
              if (pc.signalingState !== 'have-local-offer') {
                  console.warn('Received answer but not in have-local-offer state. Ignoring.');
                  continue;
              }
              await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
              console.log("Set remote description (answer) successfully.");
          } else if (data.type === 'offer') {
              if (pc.signalingState !== 'stable') {
                console.warn('Received offer but not in stable state. Ignoring renegotiation for now.');
                continue;
              }
              await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await addDoc(remoteSignalingCollectionRef!, {
                  type: 'answer',
                  payload: answer,
                  senderId: currentUser?.id,
                  timestamp: serverTimestamp(),
              });
              console.log("Responded to re-offer.");
          } else if (data.type === 'ice-candidate') {
              await pc.addIceCandidate(new RTCIceCandidate(data.payload));
          }
        } catch (error) {
            console.error("Error processing signaling message:", error);
        }
      }
    }
  });

  return () => unsubscribe();
}, [signalingCollectionRef, remoteSignalingCollectionRef, currentUser]);


  const initializePeerConnection = useCallback(async (toUser: PublicUser) => {
    if (!currentUser || !firestore) throw new Error("Current user not found");

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    
    // In a real app, get STUN/TURN servers from a service. For now, using public Google STUN.
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peerConnectionRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && remoteSignalingCollectionRef && firestore && currentUser) {
        addDoc(remoteSignalingCollectionRef, {
            type: 'ice-candidate',
            payload: event.candidate,
            senderId: currentUser.id,
            timestamp: serverTimestamp(),
        }).catch(e => console.error("Error sending ICE candidate:", e));
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected') {
        setCallStatus('connected');
        if (ringtoneIntervalRef.current) { stopRingtone(ringtoneIntervalRef.current); ringtoneIntervalRef.current = null; }
        // Start call timer
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        setCallDuration(0);
        callTimerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      } else if (state === 'disconnected' || state === 'closed' || state === 'failed') {
        endCall();
      }
    };
    return pc;
  }, [currentUser, remoteSignalingCollectionRef, stopRingtone, endCall, firestore]);


  const startCall = useCallback(async (toUser: PublicUser) => {
    if (!currentUser || !firestore) return;
    try {
        setCallStatus('calling');
        const sessionId = `call_${Date.now()}`;
        setActiveCall({ withUser: toUser, sessionId, isInitiator: true });

        const pc = await initializePeerConnection(toUser);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // This is the initial offer to the other user
        const remoteSignalingDoc = doc(firestore, 'users', toUser.id, 'signaling', currentUser.id);
        await setDoc(remoteSignalingDoc, {
            type: 'offer',
            fromUserId: currentUser.id,
            fromUserName: currentUser.displayName,
            sessionId: sessionId,
        });

        // Also post the offer to their signaling subcollection
         await addDoc(collection(firestore, remoteSignalingDoc.path, 'messages'), {
            type: 'offer',
            payload: offer,
            senderId: currentUser.id,
            timestamp: serverTimestamp(),
         });
    } catch (error: any) {
        console.error('Start call failed:', error);
        toast({ variant: 'destructive', title: 'Call Failed', description: error.message });
        cleanupCall('ended');
    }
  }, [currentUser, firestore, initializePeerConnection, toast, cleanupCall]);


  const acceptCall = useCallback(async () => {
    if (!incomingCall || !currentUser || !firestore) return;
    if (ringtoneIntervalRef.current) { stopRingtone(ringtoneIntervalRef.current); ringtoneIntervalRef.current = null; }

    const fromUser: PublicUser = {
        id: incomingCall.fromUserId,
        displayName: incomingCall.fromUserName,
        username: incomingCall.fromUserName,
        photoURL: '',
        email: '',
        createdAt: Timestamp.now(),
        xp: 0,
        level: 1,
        badgesUnlocked: [],
        status: 'offline',
        lastSeen: Timestamp.now(),
        bio: '',
        inventory: [],
        messagesSent: 0,
        notesCreated: 0,
        filesUploaded: 0,
        friends: 0,
    };
    
    try {
        setActiveCall({ withUser: fromUser, sessionId: incomingCall.sessionId, isInitiator: false });
        const pc = await initializePeerConnection(fromUser);

        // Set up listener for messages from the caller
        const remoteMessagesRef = collection(firestore, 'users', currentUser.id, 'signaling', fromUser.id, 'messages');
        onSnapshot(remoteMessagesRef, async (snapshot) => {
          for (const change of snapshot.docChanges()) {
              if (change.type === 'added') {
                  const data = change.doc.data() as SignalingDoc;
                  if (data.senderId === fromUser.id) {
                      if (data.type === 'offer') {
                          await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                          const answer = await pc.createAnswer();
                          await pc.setLocalDescription(answer);

                          // Send answer back
                          const localMessagesRef = collection(firestore, 'users', fromUser.id, 'signaling', currentUser.id, 'messages');
                          await addDoc(localMessagesRef, {
                              type: 'answer',
                              payload: answer,
                              senderId: currentUser.id,
                              timestamp: serverTimestamp()
                          });
                      } else if (data.type === 'ice-candidate') {
                           await pc.addIceCandidate(new RTCIceCandidate(data.payload));
                      }
                  }
              }
          }
        });

        setIncomingCall(null);
    } catch (error: any) {
        console.error("Failed to accept call:", error);
        toast({ variant: 'destructive', title: 'Call Failed', description: error.message });
        cleanupCall('ended');
    }
  }, [incomingCall, currentUser, firestore, initializePeerConnection, stopRingtone, toast, cleanupCall]);

  const declineCall = useCallback(async () => {
    if (!incomingCall || !currentUser || !firestore) return;
    playCallEndedSound();
     try {
        await setDoc(doc(firestore, 'users', incomingCall.fromUserId, 'signaling', currentUser.id), {
            type: 'reject-call'
        }, { merge: true });
      } catch (e) {
          console.error("Error sending reject-call signal:", e);
      }
    cleanupCall('declined');
  }, [incomingCall, currentUser, firestore, playCallEndedSound, cleanupCall]);


  const startCallTimer = useCallback(() => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallDuration(0);
    callTimerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
  }, []);

  const formatCallDuration = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  
  const toggleAudio = useCallback(() => localStream?.getAudioTracks().forEach(track => { track.enabled = !track.enabled; setIsAudioEnabled(track.enabled); }), [localStream]);
  const toggleVideo = useCallback(() => localStream?.getVideoTracks().forEach(track => { track.enabled = !track.enabled; setIsVideoEnabled(track.enabled); }), [localStream]);
  const startScreenShare = useCallback(async () => {
    if (!peerConnectionRef.current || !localStream) return;
    const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
    if (!sender) return;

    if (isScreenSharing) {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const newVideoTrack = newStream.getVideoTracks()[0];
      await sender.replaceTrack(newVideoTrack);
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(newStream);
      setIsScreenSharing(false);
    } else {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = displayStream.getVideoTracks()[0];
      await sender.replaceTrack(screenTrack);
      setLocalStream(displayStream);
      setIsScreenSharing(true);
      screenTrack.onended = () => startScreenShare(); // Revert to camera on stop
    }
  }, [isScreenSharing, localStream]);

  return {
    callStatus, localStream, remoteStream, isAudioEnabled, isVideoEnabled, isScreenSharing,
    callDuration: formatCallDuration(callDuration), incomingCall, activeCall,
    startCall, acceptCall, declineCall, endCall, toggleAudio, toggleVideo, startScreenShare
  };
};
