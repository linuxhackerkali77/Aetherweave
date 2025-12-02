
'use client';
import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useUser, UserProfile } from '@/hooks/use-user';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { useFirestore, useAuth } from '@/firebase/provider';
import { useConnections, PublicUser } from '@/hooks/use-connections';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useWebRTC } from '@/hooks/use-webrtc';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import ContactList from '@/components/chat/ContactList';
import ContactDetails from '@/components/chat/ContactDetails';
import CreateGroupModal from '@/components/chat/CreateGroupModal';
import { appEventEmitter } from '@/lib/event-emitter';
import { useRouter } from 'next/navigation';


const VideoCallView = dynamic(() => import('@/components/chat/video-call-view'), { ssr: false });
const IncomingCallNotification = dynamic(() => import('@/components/chat/incoming-call-notification'), { ssr: false });


export interface Contact {
    id: string;
    name: string;
    avatar: string;
    status: string;
    type: 'user' | 'bot' | 'group';
    members?: PublicUser[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  timestamp: Timestamp | null;
  reactions?: { [key: string]: string[] }; // emoji -> userId[]
  replyTo?: string; // messageId
  replyContent?: string;
  replySender?: string;
  role?: 'user' | 'model';
  status: 'sent' | 'delivered' | 'read';
  participants: string[];
  importantFor?: string[]; // userIds who marked this as important
}


const getDerivedStatus = (profile: PublicUser | null): {label: string, color: string, isOnline: boolean} => {
    if (!profile) return {label: 'Offline', color: 'bg-gray-500', isOnline: false};
    
    // Check lastSeen first for real-time status
    if (profile.lastSeen) {
        try {
            const lastSeenDate = profile.lastSeen.toDate ? profile.lastSeen.toDate() : new Date(profile.lastSeen as any);
            const minutesSinceSeen = (new Date().getTime() - lastSeenDate.getTime()) / (1000 * 60);

            if (minutesSinceSeen < 2) {
                return {label: 'Online', color: 'bg-green-500', isOnline: true};
            } else if (minutesSinceSeen < 10) {
                return {label: 'Away', color: 'bg-yellow-500', isOnline: true};
            }
        } catch (e) {
            console.error('Error parsing lastSeen:', e);
        }
    }
    
    // Check if user has explicit status
    if (profile.status) {
        const statusLower = profile.status.toLowerCase();
        if (statusLower === 'online') return {label: 'Online', color: 'bg-green-500', isOnline: true};
        if (statusLower === 'away') return {label: 'Away', color: 'bg-yellow-500', isOnline: true};
        if (statusLower === 'busy' || statusLower === 'do not disturb') return {label: 'Busy', color: 'bg-red-500', isOnline: true};
        if (statusLower === 'offline') return {label: 'Offline', color: 'bg-gray-500', isOnline: false};
        return {label: profile.status, color: 'bg-blue-500', isOnline: true};
    }
    
    return {label: 'Offline', color: 'bg-gray-500', isOnline: false};
}


const aetherBotContact: Contact = {
    id: 'aether-bot',
    name: 'Aether',
    avatar: '',
    status: 'Online',
    type: 'bot',
};

function ChatPageContent() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, profile, loading: userLoading, incrementStat } = useUser();
  const { connections: userConnections, users: connectedUsers, loading: connectionsLoading } = useConnections();
  const currentUser = useMemo(() => profile ? { ...profile } : null, [profile]);
  const {
    callStatus,
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    callDuration,
    isScreenSharing,
    activeCall,
    incomingCall,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    startScreenShare
  } = useWebRTC(currentUser);

  
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pinnedUsers, setPinnedUsers] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [chatId, setChatId] = useState<string | null>('aether-bot');
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupCreating, setGroupCreating] = useState(false);


  useEffect(() => {
    setIsClient(true);
    const handlePinUser = (userToPin: PublicUser) => {
        const contactToPin = connectedUsers.find(u => u.id === userToPin.id);
        if (contactToPin) {
             setPinnedUsers(prev => {
                if (prev.find(p => p.id === contactToPin.id)) return prev;
                return [...prev, contactToPin as Contact];
             });
        }
    };
    
    const handleShowUserProfile = (userId: string) => {
        router.push(`/profile/${userId}`);
    }

    const handleReplyTo = (message: Message) => {
      setReplyToMessage(message);
    }

    const handleForwardMessage = (message: Message) => {
      setForwardingMessage(message);
    }
    
    appEventEmitter.on('ui:pin-user', handlePinUser);
    appEventEmitter.on('ui:show-user-profile', handleShowUserProfile);
    appEventEmitter.on('chat:reply-to', handleReplyTo);
    appEventEmitter.on('chat:forward-message', handleForwardMessage);

    return () => {
        appEventEmitter.off('ui:pin-user', handlePinUser);
        appEventEmitter.off('ui:show-user-profile', handleShowUserProfile);
        appEventEmitter.off('chat:reply-to', handleReplyTo);
        appEventEmitter.off('chat:forward-message', handleForwardMessage);
    };
  }, [connectedUsers, router]);

  const pageLoading = userLoading || connectionsLoading;

  const handleSelectContact = useCallback((contact: Contact | null) => {
    setSelectedContact(contact);
    setReplyToMessage(null); // Clear reply when changing chats
    setForwardingMessage(null); // Clear forward when changing chats
  }, []);


  // Populate contacts from connections hook
  useEffect(() => {
    if (pageLoading || !user) return;
    
    const friendContacts: Contact[] = userConnections
      .filter(c => c.status === 'friends')
      .map(conn => connectedUsers.find(u => u.id === conn.id))
      .filter((u): u is PublicUser => !!u)
      .map(u => ({
          id: u.id,
          name: u.displayName || 'Unknown',
          avatar: u.photoURL || '',
          status: getDerivedStatus(u).label,
          type: 'user'
      }));
      
    // Add existing groups to contacts
    const groupContacts: Contact[] = [];
    // TODO: Fetch user's groups from Firestore
    
    const allContacts = [...friendContacts, ...groupContacts];

    setContacts(allContacts);

    const contactId = searchParams.get('contactId');
    if (contactId && !selectedContact) {
        const contactToSelect = allContacts.find(c => c.id === contactId);
        if (contactToSelect) {
            setSelectedContact(contactToSelect);
        }
    } else if (!selectedContact && allContacts.length > 0) {
      setSelectedContact(allContacts[0]);
    }
    
  }, [userConnections, connectedUsers, pageLoading, searchParams, selectedContact, user]);


  // Determine chat ID based on selected contact
  useEffect(() => {
    if (pageLoading || !user || !selectedContact || !firestore) return;

    const getOrCreateChat = async () => {
      if (selectedContact.id === 'aether-bot') {
        setMessages([]); // Clear messages for the bot
        setChatId('aether-bot');
        
        // Ensure aether-bot chat document exists
        const botChatRef = doc(firestore, 'chats', 'aether-bot');
        try {
          const botChatSnap = await getDoc(botChatRef);
          if (!botChatSnap.exists()) {
            await setDoc(botChatRef, {
              participants: [user.uid, 'aether-bot'],
              isGroup: false,
              createdAt: serverTimestamp(),
            });
          }
        } catch (error) {
          console.error("Error creating aether-bot chat:", error);
        }
        return;
      }
      
      if (selectedContact.type === 'group') {
        setChatId(selectedContact.id);
        return;
      }

      // For one-on-one chats, create a consistent chat ID
      const oneOnOneChatId = [user.uid, selectedContact.id].sort().join('_');
      const chatRef = doc(firestore, 'chats', oneOnOneChatId);
      
      try {
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) {
          // Create the chat document if it doesn't exist
          const participantsMap: { [key: string]: boolean } = {};
          participantsMap[user.uid] = true;
          participantsMap[selectedContact.id] = true;
          
          const chatData = {
            participants: participantsMap,
            isGroup: false,
            createdAt: serverTimestamp(),
          };

          await setDoc(chatRef, chatData);
        }
      } catch (error) {
        console.error("Error ensuring chat document exists:", error);
      }

      setChatId(oneOnOneChatId);
    };

    getOrCreateChat();

  }, [user, pageLoading, selectedContact, firestore]);
  
  // Listen for messages in the selected chat
  useEffect(() => {
    if (!chatId || !firestore || pageLoading || !auth.currentUser) {
        if (chatId === 'aether-bot' && user) {
            const saved = localStorage.getItem(`aether-bot-${user.uid}`);
            setMessages(saved ? JSON.parse(saved) : []);
        } else {
            setMessages([]);
        }
        return;
    }
    
    if (selectedContact?.type === 'bot') {
        if (user) {
            const saved = localStorage.getItem(`aether-bot-${user.uid}`);
            setMessages(saved ? JSON.parse(saved) : []);
        }
        return;
    }

    const messagesCollection = collection(firestore, 'chats', chatId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      appEventEmitter.emit('ui:sound', 'success'); // Play sound on new message
      const msgs: Message[] = [];
      const userCache: Record<string, { displayName: string, photoURL: string }> = {};

      for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          const senderId = data.senderId;

          if (!userCache[senderId]) {
              const userDoc = await getDoc(doc(firestore, 'users', senderId));
              const senderData = userDoc.data();
              userCache[senderId] = {
                  displayName: senderData?.displayName || 'Unknown User',
                  photoURL: senderData?.photoURL || ''
              };
          }
          
          const sender = userCache[senderId];

          msgs.push({
             id: docSnap.id,
             ...data,
             senderName: sender.displayName,
             senderAvatar: sender.photoURL,
          } as Message)
      }
      setMessages(msgs);
    }, (error) => {
        console.error('Error fetching messages:', error);
    });

    return () => unsubscribe();
  }, [chatId, firestore, selectedContact, auth, pageLoading]);

  const handleCreateGroup = useCallback(async (groupName: string, selectedMembers: PublicUser[]) => {
    if (!user || !firestore) return;
    
    setGroupCreating(true);
    try {
      // Create group document
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const groupRef = doc(firestore, 'chats', groupId);
      
      const participantsMap: { [key: string]: boolean } = {};
      participantsMap[user.uid] = true;
      selectedMembers.forEach(member => {
        participantsMap[member.id] = true;
      });
      
      await setDoc(groupRef, {
        name: groupName,
        participants: participantsMap,
        isGroup: true,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        members: [user.uid, ...selectedMembers.map(m => m.id)]
      });
      
      // Create new group contact
      const newGroupContact: Contact = {
        id: groupId,
        name: groupName,
        avatar: '',
        status: `${selectedMembers.length + 1} members`,
        type: 'group',
        members: [currentUser as PublicUser, ...selectedMembers]
      };
      
      setContacts(prev => [...prev, newGroupContact]);
      setSelectedContact(newGroupContact);
      setShowCreateGroup(false);
      
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setGroupCreating(false);
    }
  }, [user, firestore, currentUser]);

    const handleStartCall = useCallback((type: 'video' | 'voice') => {
        if (!selectedContact || selectedContact.type !== 'user' || !user) return;
        const targetUser = connectedUsers.find(u => u.id === selectedContact.id);
        if (targetUser) {
            startCall(targetUser);
        }
    }, [selectedContact, startCall, connectedUsers, user]);


  const incomingCallUser = useMemo(() => {
        if (!incomingCall) return undefined;
        return connectedUsers.find(u => u.id === incomingCall.fromUserId);
  }, [incomingCall, connectedUsers]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[300px_1fr_300px] gap-x-2 md:gap-x-4 h-full">
        <ContactList
            contacts={contacts}
            pinnedContacts={pinnedUsers}
            selectedContact={selectedContact}
            onSelectContact={handleSelectContact}
            loading={pageLoading}
            isClient={isClient}
            onCreateGroup={() => setShowCreateGroup(true)}
            connectedUsers={connectedUsers}
        />

        <div className="flex flex-col h-full lg:col-start-2 min-h-0">
          {pageLoading ? (
             <div className="flex-1 flex flex-col gap-4">
                <Card className="flex flex-col min-h-0 h-full">
                    <CardHeader><div className="h-10 w-full bg-muted animate-pulse rounded-md" /></CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </CardContent>
                </Card>
             </div>
          ) : (
          <Card className="flex-1 flex flex-col min-h-0 mx-1 lg:mx-0">
            <ChatHeader 
                contact={selectedContact}
                onStartCall={handleStartCall}
                connectedUsers={connectedUsers}
                isClient={isClient}
            />
            <div className="flex flex-col flex-grow min-h-0 border-t">
                <MessageList
                    messages={messages}
                    chatId={chatId}
                    currentUser={user}
                    connectedUsers={connectedUsers}
                />
                <MessageInput
                    chatId={chatId}
                    selectedContact={selectedContact}
                    messages={messages}
                    setMessages={setMessages}
                    replyingTo={replyToMessage}
                    setReplyingTo={setReplyToMessage}
                    forwardingMessage={forwardingMessage}
                    setForwardingMessage={setForwardingMessage}
                />
            </div>
          </Card>
          )}
        </div>
        
       <ContactDetails contact={selectedContact} connectedUsers={connectedUsers} isClient={isClient} />

      </div>

      {callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'declined' && (
        <VideoCallView
          state={callStatus}
          localStream={localStream}
          remoteStream={remoteStream}
          onHangup={endCall}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          duration={callDuration}
          peer={activeCall?.withUser}
          status={callStatus}
          onScreenShare={startScreenShare}
          isScreenSharing={isScreenSharing}
        />
      )}
      {callStatus === 'ringing' && incomingCall && (
        <IncomingCallNotification
          caller={connectedUsers.find(u => u.id === incomingCall.fromUserId)}
          onAccept={acceptCall}
          onReject={declineCall}
        />
      )}
      
      <CreateGroupModal
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        friends={userConnections
          .filter(c => c.status === 'friends')
          .map(conn => connectedUsers.find(u => u.id === conn.id))
          .filter((u): u is PublicUser => !!u)
        }
        onCreateGroup={handleCreateGroup}
        loading={groupCreating}
      />
    </>
  );
}


function ChatPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary w-12 h-12"/></div>}>
      <ChatPageContent />
    </Suspense>
  )
}

export default function ChatPage() {
    return (
      <div className="h-full">
          <ChatPageWrapper />
      </div>
    )
  }

    