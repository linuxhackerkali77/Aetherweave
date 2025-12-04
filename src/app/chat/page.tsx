
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
import GroupSettingsModal from '@/components/chat/GroupSettingsModal';
import { appEventEmitter } from '@/lib/event-emitter';
import { useRouter } from 'next/navigation';
import { getDerivedStatus } from '@/lib/chat-utils';
import { Contact, Message, aetherBotContact } from '@/types/chat';


const VideoCallView = dynamic(() => import('@/components/chat/video-call-view'), { ssr: false });
const IncomingCallNotification = dynamic(() => import('@/components/chat/incoming-call-notification'), { ssr: false });




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
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [selectedGroupForSettings, setSelectedGroupForSettings] = useState<Contact | null>(null);

  const handleLeaveGroup = useCallback(async (group: Contact) => {
    if (!user || !firestore) return;
    if (window.confirm(`Are you sure you want to leave ${group.name}?`)) {
      try {
        const groupRef = doc(firestore, 'chats', group.id);
        const groupDoc = await getDoc(groupRef);
        if (groupDoc.exists()) {
          const data = groupDoc.data();
          const updatedParticipants = { ...data.participants };
          delete updatedParticipants[user.uid];
          const updatedMembers = (data.members || []).filter((id: string) => id !== user.uid);
          
          await updateDoc(groupRef, {
            participants: updatedParticipants,
            members: updatedMembers
          });
          
          setContacts(prev => prev.filter(c => c.id !== group.id));
          if (selectedContact?.id === group.id) {
            setSelectedContact(null);
          }
        }
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  }, [user, firestore, selectedContact]);

  const handleDeleteGroup = useCallback(async (group: Contact) => {
    if (!user || !firestore) return;
    if (window.confirm(`Are you sure you want to delete ${group.name}? This cannot be undone.`)) {
      try {
        const groupRef = doc(firestore, 'chats', group.id);
        await updateDoc(groupRef, {
          deleted: true,
          deletedAt: serverTimestamp()
        });
        
        setContacts(prev => prev.filter(c => c.id !== group.id));
        if (selectedContact?.id === group.id) {
          setSelectedContact(null);
        }
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  }, [user, firestore, selectedContact]);

  useEffect(() => {
    setIsClient(true);
    const handlePinUser = (userToPin: PublicUser) => {
        const contactToPin = connectedUsers.find(u => u.id === userToPin.id);
        if (contactToPin) {
             setPinnedUsers(prev => {
                if (prev.find(p => p.id === contactToPin.id)) return prev;
                const contact: Contact = {
                  id: contactToPin.id,
                  name: contactToPin.displayName || 'Unknown',
                  avatar: contactToPin.photoURL || '',
                  status: getDerivedStatus(contactToPin).label,
                  type: 'user'
                };
                return [...prev, contact];
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

    const handleGroupInfo = (group: Contact) => {
      setSelectedGroupForSettings(group);
      setShowGroupSettings(true);
    }

    const handleEditGroup = (group: Contact) => {
      setSelectedGroupForSettings(group);
      setShowGroupSettings(true);
    }
    
    appEventEmitter.on('ui:pin-user', handlePinUser);
    appEventEmitter.on('ui:show-user-profile', handleShowUserProfile);
    appEventEmitter.on('chat:reply-to', handleReplyTo);
    appEventEmitter.on('chat:forward-message', handleForwardMessage);
    appEventEmitter.on('group:show-info', handleGroupInfo);
    appEventEmitter.on('group:edit', handleEditGroup);
    appEventEmitter.on('group:leave', handleLeaveGroup);
    appEventEmitter.on('group:delete', handleDeleteGroup);

    return () => {
        appEventEmitter.off('ui:pin-user', handlePinUser);
        appEventEmitter.off('ui:show-user-profile', handleShowUserProfile);
        appEventEmitter.off('chat:reply-to', handleReplyTo);
        appEventEmitter.off('chat:forward-message', handleForwardMessage);
        appEventEmitter.off('group:show-info', handleGroupInfo);
        appEventEmitter.off('group:edit', handleEditGroup);
        appEventEmitter.off('group:leave', handleLeaveGroup);
        appEventEmitter.off('group:delete', handleDeleteGroup);
    };
  }, [connectedUsers, router, handleLeaveGroup, handleDeleteGroup]);

  const pageLoading = userLoading || connectionsLoading;

  const handleSelectContact = useCallback((contact: Contact | null) => {
    setSelectedContact(contact);
    setReplyToMessage(null); // Clear reply when changing chats
    setForwardingMessage(null); // Clear forward when changing chats
  }, []);


  // Populate contacts from connections hook
  useEffect(() => {
    if (pageLoading || !user || !firestore) return;
    
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
      
    // Fetch user's groups from Firestore
    const fetchGroups = async () => {
      try {
        const chatsQuery = query(
          collection(firestore, 'chats'),
          orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
          const groupContacts: Contact[] = [];
          
          for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.isGroup && data.participants && data.participants[user.uid]) {
              // Get member details
              const memberIds = data.members || Object.keys(data.participants);
              const members: PublicUser[] = [];
              
              for (const memberId of memberIds) {
                const memberUser = connectedUsers.find(u => u.id === memberId);
                if (memberUser) {
                  members.push(memberUser);
                }
              }
              
              groupContacts.push({
                id: doc.id,
                name: data.name || 'Unnamed Group',
                avatar: data.avatar || '',
                status: `${memberIds.length} members`,
                type: 'group',
                members
              });
            }
          }
          
          const allContacts = [...friendContacts, ...groupContacts];
          setContacts(allContacts);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching groups:', error);
        const allContacts = [...friendContacts];
        setContacts(allContacts);
      }
    };
    
    fetchGroups();

    const contactId = searchParams.get('contactId');
    if (contactId && !selectedContact) {
        // Wait for contacts to be populated before selecting
        setTimeout(() => {
          setContacts(current => {
            const contactToSelect = current.find(c => c.id === contactId);
            if (contactToSelect) {
              setSelectedContact(contactToSelect);
            }
            return current;
          });
        }, 100);
    }
    
  }, [userConnections, connectedUsers, pageLoading, searchParams, selectedContact, user, firestore]);


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
        members: [user.uid, ...selectedMembers.map(m => m.id)],
        avatar: '',
        admins: [user.uid] // Creator is admin
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

  const handleUpdateGroup = useCallback(async (groupId: string, updates: { name?: string; avatar?: string }) => {
    if (!user || !firestore) return;
    
    try {
      const groupRef = doc(firestore, 'chats', groupId);
      await updateDoc(groupRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });
      
      // Update local contacts
      setContacts(prev => prev.map(contact => 
        contact.id === groupId 
          ? { ...contact, ...updates }
          : contact
      ));
      
      // Update selected contact if it's the same group
      if (selectedContact?.id === groupId) {
        setSelectedContact(prev => prev ? { ...prev, ...updates } : null);
      }
      
    } catch (error) {
      console.error('Error updating group:', error);
    }
  }, [user, firestore, selectedContact]);

  const handleRemoveMember = useCallback(async (groupId: string, memberId: string) => {
    if (!user || !firestore) return;
    
    try {
      const groupRef = doc(firestore, 'chats', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        const data = groupDoc.data();
        const updatedParticipants = { ...data.participants };
        delete updatedParticipants[memberId];
        const updatedMembers = (data.members || []).filter((id: string) => id !== memberId);
        
        await updateDoc(groupRef, {
          participants: updatedParticipants,
          members: updatedMembers
        });
        
        // Update local contacts
        setContacts(prev => prev.map(contact => 
          contact.id === groupId 
            ? { 
                ...contact, 
                members: contact.members?.filter(m => m.id !== memberId),
                status: `${updatedMembers.length} members`
              }
            : contact
        ));
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  }, [user, firestore]);

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
      
      <GroupSettingsModal
        open={showGroupSettings}
        onOpenChange={setShowGroupSettings}
        group={selectedGroupForSettings}
        onUpdateGroup={handleUpdateGroup}
        onRemoveMember={handleRemoveMember}
        onLeaveGroup={handleLeaveGroup}
        onDeleteGroup={handleDeleteGroup}
        currentUserId={user?.uid || ''}
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

    