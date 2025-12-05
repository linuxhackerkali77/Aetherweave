'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  deleteDoc,
  writeBatch,
  getDocs,
  serverTimestamp,
  Timestamp,
  where,
  getDoc,
  updateDoc,
  addDoc,
  orderBy,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/hooks/use-user';

export interface SpaceMember {
  oderId: string;
  odername: string;
  role: string;
  joinedAt: Timestamp;
  onboardingCompleted: boolean;
}

export interface SpaceRole {
  id: string;
  name: string;
  color: string;
  position: number;
  permissions: number;
  isDefault?: boolean;
}

export interface SpaceCategory {
  id: string;
  name: string;
  position: number;
  isCollapsed?: boolean;
}

export interface SpaceChannel {
  id: string;
  name: string;
  description?: string;
  type: 'text' | 'voice' | 'stage' | 'announcement' | 'feed';
  categoryId?: string;
  position: number;
  isNsfw?: boolean;
  slowMode?: number;
  permissionOverrides?: Record<string, { allow: number; deny: number }>;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
  ownerId: string;
  ownerUsername?: string;
  isPublic: boolean;
  boostLevel: number;
  boostCount: number;
  inviteCode?: string;
  memberCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SpaceMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  replyToId?: string;
  attachments?: any[];
  embeds?: any[];
  mentions?: string[];
  reactions?: Record<string, string[]>;
  isEdited?: boolean;
  isPinned?: boolean;
  createdAt: Timestamp;
  editedAt?: Timestamp;
}

export const PermissionFlags = {
  ADMINISTRATOR: 1 << 0,
  MANAGE_SERVER: 1 << 1,
  MANAGE_CHANNELS: 1 << 2,
  MANAGE_ROLES: 1 << 3,
  MANAGE_MESSAGES: 1 << 4,
  KICK_MEMBERS: 1 << 5,
  BAN_MEMBERS: 1 << 6,
  SEND_MESSAGES: 1 << 7,
  EMBED_LINKS: 1 << 8,
  ATTACH_FILES: 1 << 9,
  ADD_REACTIONS: 1 << 10,
  MENTION_EVERYONE: 1 << 11,
  CONNECT: 1 << 12,
  SPEAK: 1 << 13,
  MUTE_MEMBERS: 1 << 14,
  DEAFEN_MEMBERS: 1 << 15,
  MOVE_MEMBERS: 1 << 16,
  VIEW_CHANNELS: 1 << 17,
  CREATE_INVITES: 1 << 18,
};

const DEFAULT_MEMBER_PERMISSIONS = 
  PermissionFlags.VIEW_CHANNELS |
  PermissionFlags.SEND_MESSAGES |
  PermissionFlags.EMBED_LINKS |
  PermissionFlags.ATTACH_FILES |
  PermissionFlags.ADD_REACTIONS |
  PermissionFlags.CONNECT |
  PermissionFlags.SPEAK |
  PermissionFlags.CREATE_INVITES;

const ADMIN_PERMISSIONS = Object.values(PermissionFlags).reduce((a, b) => a | b, 0);

export function useSpaces() {
  const firestore = useFirestore();
  const { user, profile } = useUser();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [mySpaces, setMySpaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [categories, setCategories] = useState<SpaceCategory[]>([]);
  const [channels, setChannels] = useState<SpaceChannel[]>([]);
  const [roles, setRoles] = useState<SpaceRole[]>([]);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SpaceMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !user) {
      setMySpaces([]);
      setSpaces([]);
      setLoading(false);
      return;
    }

    const membershipRef = collection(firestore, 'users', user.uid, 'spaceMemberships');
    
    const unsubscribe = onSnapshot(membershipRef, async (snapshot) => {
      const membershipIds = snapshot.docs.map(doc => doc.id);
      setMySpaces(membershipIds);

      if (membershipIds.length > 0) {
        const spacesData: Space[] = [];
        
        for (const spaceId of membershipIds) {
          try {
            const spaceDoc = await getDoc(doc(firestore, 'spaces', spaceId));
            if (spaceDoc.exists()) {
              spacesData.push({ id: spaceDoc.id, ...spaceDoc.data() } as Space);
            }
          } catch (e) {
            console.error('Error fetching space:', spaceId, e);
          }
        }
        
        setSpaces(spacesData);
        
        if (!activeSpaceId && spacesData.length > 0) {
          setActiveSpaceId(spacesData[0].id);
        }
      } else {
        setSpaces([]);
      }
      
      setLoading(false);
    }, (err) => {
      console.error('Error fetching memberships:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user, activeSpaceId]);

  useEffect(() => {
    if (!firestore || !activeSpaceId) {
      setActiveSpace(null);
      setCategories([]);
      setChannels([]);
      setRoles([]);
      return;
    }

    const spaceRef = doc(firestore, 'spaces', activeSpaceId);
    const categoriesRef = collection(firestore, 'spaces', activeSpaceId, 'categories');
    const channelsRef = collection(firestore, 'spaces', activeSpaceId, 'channels');
    const rolesRef = collection(firestore, 'spaces', activeSpaceId, 'roles');
    const membersRef = collection(firestore, 'spaces', activeSpaceId, 'members');

    const unsubSpace = onSnapshot(spaceRef, (doc) => {
      if (doc.exists()) {
        setActiveSpace({ id: doc.id, ...doc.data() } as Space);
      }
    });

    const unsubCategories = onSnapshot(query(categoriesRef, orderBy('position')), (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SpaceCategory)));
    });

    const unsubChannels = onSnapshot(query(channelsRef, orderBy('position')), (snapshot) => {
      const channelData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SpaceChannel));
      setChannels(channelData);
      
      if (!activeChannelId && channelData.length > 0) {
        const textChannel = channelData.find(c => c.type === 'text');
        if (textChannel) {
          setActiveChannelId(textChannel.id);
        }
      }
    });

    const unsubRoles = onSnapshot(query(rolesRef, orderBy('position', 'desc')), (snapshot) => {
      setRoles(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SpaceRole)));
    });

    const unsubMembers = onSnapshot(membersRef, (snapshot) => {
      setMembers(snapshot.docs.map(d => ({ oderId: d.id, ...d.data() } as SpaceMember)));
    });

    return () => {
      unsubSpace();
      unsubCategories();
      unsubChannels();
      unsubRoles();
      unsubMembers();
    };
  }, [firestore, activeSpaceId, activeChannelId]);

  useEffect(() => {
    if (!firestore || !activeSpaceId || !activeChannelId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(firestore, 'spaces', activeSpaceId, 'channels', activeChannelId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SpaceMessage)));
    });

    return () => unsubMessages();
  }, [firestore, activeSpaceId, activeChannelId]);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createSpace = useCallback(async (name: string, iconUrl?: string, description?: string): Promise<{ success: boolean; spaceId?: string; error?: string }> => {
    if (!firestore || !user || !profile) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const inviteCode = generateInviteCode();
      const now = serverTimestamp();

      const spaceData = {
        name,
        description: description || '',
        iconUrl: iconUrl || null,
        bannerUrl: null,
        ownerId: user.uid,
        ownerUsername: profile.gaming?.username || profile.displayName || profile.username,
        isPublic: true,
        boostLevel: 0,
        boostCount: 0,
        inviteCode,
        memberCount: 1,
        createdAt: now,
        updatedAt: now,
      };

      const spaceRef = await addDoc(collection(firestore, 'spaces'), spaceData);
      const spaceId = spaceRef.id;

      const batch = writeBatch(firestore);

      batch.set(doc(firestore, 'spaces', spaceId, 'roles', 'everyone'), {
        name: '@everyone',
        color: '#99AAB5',
        position: 0,
        permissions: DEFAULT_MEMBER_PERMISSIONS,
        isDefault: true,
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'roles', 'admin'), {
        name: 'Admin',
        color: '#E74C3C',
        position: 100,
        permissions: ADMIN_PERMISSIONS,
        isDefault: false,
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'roles', 'moderator'), {
        name: 'Moderator',
        color: '#3498DB',
        position: 50,
        permissions: DEFAULT_MEMBER_PERMISSIONS | PermissionFlags.MANAGE_MESSAGES | PermissionFlags.KICK_MEMBERS | PermissionFlags.MUTE_MEMBERS,
        isDefault: false,
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'categories', 'info'), {
        name: 'INFO',
        position: 0,
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'categories', 'text'), {
        name: 'TEXT CHANNELS',
        position: 1,
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'categories', 'voice'), {
        name: 'VOICE CHANNELS',
        position: 2,
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'channels', 'welcome'), {
        name: 'welcome',
        type: 'text',
        categoryId: 'info',
        position: 0,
        description: 'Welcome to the server!',
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'channels', 'announcements'), {
        name: 'announcements',
        type: 'announcement',
        categoryId: 'info',
        position: 1,
        description: 'Important announcements',
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'channels', 'general'), {
        name: 'general',
        type: 'text',
        categoryId: 'text',
        position: 0,
        description: 'General discussion',
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'channels', 'off-topic'), {
        name: 'off-topic',
        type: 'text',
        categoryId: 'text',
        position: 1,
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'channels', 'lobby'), {
        name: 'Lobby',
        type: 'voice',
        categoryId: 'voice',
        position: 0,
      });

      batch.set(doc(firestore, 'spaces', spaceId, 'members', user.uid), {
        odername: profile.gaming?.username || profile.displayName || profile.username,
        role: 'owner',
        joinedAt: now,
        onboardingCompleted: true,
        roles: ['admin'],
      });

      batch.set(doc(firestore, 'users', user.uid, 'spaceMemberships', spaceId), {
        joinedAt: now,
        nickname: null,
      });

      await batch.commit();

      setActiveSpaceId(spaceId);
      
      return { success: true, spaceId };
    } catch (err: any) {
      console.error('Error creating space:', err);
      return { success: false, error: err.message };
    }
  }, [firestore, user, profile]);

  const joinSpaceByInvite = useCallback(async (inviteCode: string): Promise<{ success: boolean; spaceName?: string; error?: string }> => {
    if (!firestore || !user || !profile) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const spacesQuery = query(collection(firestore, 'spaces'), where('inviteCode', '==', inviteCode.toUpperCase()));
      const snapshot = await getDocs(spacesQuery);

      if (snapshot.empty) {
        return { success: false, error: 'No space found with that invite code.' };
      }

      const spaceDoc = snapshot.docs[0];
      const spaceId = spaceDoc.id;
      const spaceData = spaceDoc.data();

      const memberRef = doc(firestore, 'spaces', spaceId, 'members', user.uid);
      const existingMember = await getDoc(memberRef);

      if (existingMember.exists()) {
        setActiveSpaceId(spaceId);
        return { success: true, spaceName: spaceData.name };
      }

      const now = serverTimestamp();
      const batch = writeBatch(firestore);

      batch.set(memberRef, {
        odername: profile.gaming?.username || profile.displayName || profile.username,
        role: 'member',
        joinedAt: now,
        onboardingCompleted: false,
        roles: [],
      });

      batch.set(doc(firestore, 'users', user.uid, 'spaceMemberships', spaceId), {
        joinedAt: now,
        nickname: null,
      });

      batch.update(doc(firestore, 'spaces', spaceId), {
        memberCount: (spaceData.memberCount || 0) + 1,
        updatedAt: now,
      });

      await batch.commit();

      setActiveSpaceId(spaceId);
      
      return { success: true, spaceName: spaceData.name };
    } catch (err: any) {
      console.error('Error joining space:', err);
      return { success: false, error: err.message };
    }
  }, [firestore, user, profile]);

  const leaveSpace = useCallback(async (spaceId: string): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const spaceDoc = await getDoc(doc(firestore, 'spaces', spaceId));
      if (!spaceDoc.exists()) {
        return { success: false, error: 'Space not found' };
      }

      const spaceData = spaceDoc.data();
      
      if (spaceData.ownerId === user.uid) {
        return { success: false, error: 'You are the owner. Transfer ownership or delete the space.' };
      }

      const batch = writeBatch(firestore);
      
      batch.delete(doc(firestore, 'spaces', spaceId, 'members', user.uid));
      batch.delete(doc(firestore, 'users', user.uid, 'spaceMemberships', spaceId));
      batch.update(doc(firestore, 'spaces', spaceId), {
        memberCount: Math.max((spaceData.memberCount || 1) - 1, 0),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      
      if (activeSpaceId === spaceId) {
        setActiveSpaceId(null);
      }
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, user, activeSpaceId]);

  const deleteSpace = useCallback(async (spaceId: string): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const spaceDoc = await getDoc(doc(firestore, 'spaces', spaceId));
      if (!spaceDoc.exists()) {
        return { success: false, error: 'Space not found' };
      }

      const spaceData = spaceDoc.data();
      
      if (spaceData.ownerId !== user.uid) {
        return { success: false, error: 'Only the owner can delete this space.' };
      }

      await deleteDoc(doc(firestore, 'spaces', spaceId));
      await deleteDoc(doc(firestore, 'users', user.uid, 'spaceMemberships', spaceId));
      
      if (activeSpaceId === spaceId) {
        setActiveSpaceId(null);
      }
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, user, activeSpaceId]);

  const sendMessage = useCallback(async (content: string, replyToId?: string): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !user || !profile || !activeSpaceId || !activeChannelId) {
      return { success: false, error: 'Not ready to send messages' };
    }

    try {
      const messagesRef = collection(firestore, 'spaces', activeSpaceId, 'channels', activeChannelId, 'messages');
      
      await addDoc(messagesRef, {
        authorId: user.uid,
        authorUsername: profile.gaming?.username || profile.displayName || profile.username,
        authorAvatar: profile.photoURL || null,
        content,
        replyToId: replyToId || null,
        attachments: [],
        embeds: [],
        mentions: [],
        reactions: {},
        isEdited: false,
        isPinned: false,
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, user, profile, activeSpaceId, activeChannelId]);

  const editMessage = useCallback(async (messageId: string, newContent: string): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId || !activeChannelId) {
      return { success: false, error: 'Not ready' };
    }

    try {
      const messageRef = doc(firestore, 'spaces', activeSpaceId, 'channels', activeChannelId, 'messages', messageId);
      await updateDoc(messageRef, {
        content: newContent,
        isEdited: true,
        editedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId, activeChannelId]);

  const deleteMessage = useCallback(async (messageId: string): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId || !activeChannelId) {
      return { success: false, error: 'Not ready' };
    }

    try {
      await deleteDoc(doc(firestore, 'spaces', activeSpaceId, 'channels', activeChannelId, 'messages', messageId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId, activeChannelId]);

  const addReaction = useCallback(async (messageId: string, emoji: string): Promise<void> => {
    if (!firestore || !user || !activeSpaceId || !activeChannelId) return;

    try {
      const messageRef = doc(firestore, 'spaces', activeSpaceId, 'channels', activeChannelId, 'messages', messageId);
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayUnion(user.uid),
      });
    } catch (err: any) {
      console.error('Error adding reaction:', err);
    }
  }, [firestore, user, activeSpaceId, activeChannelId]);

  const removeReaction = useCallback(async (messageId: string, emoji: string): Promise<void> => {
    if (!firestore || !user || !activeSpaceId || !activeChannelId) return;

    try {
      const messageRef = doc(firestore, 'spaces', activeSpaceId, 'channels', activeChannelId, 'messages', messageId);
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayRemove(user.uid),
      });
    } catch (err: any) {
      console.error('Error removing reaction:', err);
    }
  }, [firestore, user, activeSpaceId, activeChannelId]);

  const createCategory = useCallback(async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId) {
      return { success: false, error: 'Not ready' };
    }

    try {
      const categoriesRef = collection(firestore, 'spaces', activeSpaceId, 'categories');
      await addDoc(categoriesRef, {
        name,
        position: categories.length,
        isCollapsed: false,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId, categories.length]);

  const deleteCategory = useCallback(async (categoryId: string): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId) {
      return { success: false, error: 'Not ready' };
    }

    try {
      await deleteDoc(doc(firestore, 'spaces', activeSpaceId, 'categories', categoryId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId]);

  const createChannel = useCallback(async (name: string, type: SpaceChannel['type'], categoryId?: string): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId) {
      return { success: false, error: 'Not ready' };
    }

    try {
      const channelsRef = collection(firestore, 'spaces', activeSpaceId, 'channels');
      const categoryChannels = channels.filter(c => c.categoryId === categoryId);
      
      await addDoc(channelsRef, {
        name: name.toLowerCase().replace(/\s+/g, '-'),
        type,
        categoryId: categoryId || null,
        position: categoryChannels.length,
        isNsfw: false,
        slowMode: 0,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId, channels]);

  const updateChannel = useCallback(async (channelId: string, updates: Partial<SpaceChannel>): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId) {
      return { success: false, error: 'Not ready' };
    }

    try {
      await updateDoc(doc(firestore, 'spaces', activeSpaceId, 'channels', channelId), updates);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId]);

  const deleteChannel = useCallback(async (channelId: string): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId) {
      return { success: false, error: 'Not ready' };
    }

    try {
      await deleteDoc(doc(firestore, 'spaces', activeSpaceId, 'channels', channelId));
      
      if (activeChannelId === channelId) {
        const remainingChannels = channels.filter(c => c.id !== channelId && c.type === 'text');
        setActiveChannelId(remainingChannels[0]?.id || null);
      }
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId, activeChannelId, channels]);

  const createRole = useCallback(async (name: string, color: string, permissions: number): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId) {
      return { success: false, error: 'Not ready' };
    }

    try {
      const rolesRef = collection(firestore, 'spaces', activeSpaceId, 'roles');
      await addDoc(rolesRef, {
        name,
        color,
        position: roles.length + 1,
        permissions,
        isDefault: false,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId, roles.length]);

  const updateRole = useCallback(async (roleId: string, updates: Partial<SpaceRole>): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId) {
      return { success: false, error: 'Not ready' };
    }

    try {
      await updateDoc(doc(firestore, 'spaces', activeSpaceId, 'roles', roleId), updates);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId]);

  const deleteRole = useCallback(async (roleId: string): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId) {
      return { success: false, error: 'Not ready' };
    }

    const role = roles.find(r => r.id === roleId);
    if (role?.isDefault) {
      return { success: false, error: 'Cannot delete the default role.' };
    }

    try {
      await deleteDoc(doc(firestore, 'spaces', activeSpaceId, 'roles', roleId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId, roles]);

  const assignRole = useCallback(async (memberId: string, roleId: string): Promise<void> => {
    if (!firestore || !activeSpaceId) return;

    try {
      const memberRef = doc(firestore, 'spaces', activeSpaceId, 'members', memberId);
      await updateDoc(memberRef, {
        roles: arrayUnion(roleId),
      });
    } catch (err: any) {
      console.error('Error assigning role:', err);
    }
  }, [firestore, activeSpaceId]);

  const removeRole = useCallback(async (memberId: string, roleId: string): Promise<void> => {
    if (!firestore || !activeSpaceId) return;

    try {
      const memberRef = doc(firestore, 'spaces', activeSpaceId, 'members', memberId);
      await updateDoc(memberRef, {
        roles: arrayRemove(roleId),
      });
    } catch (err: any) {
      console.error('Error removing role:', err);
    }
  }, [firestore, activeSpaceId]);

  const updateSpaceSettings = useCallback(async (updates: Partial<Space>): Promise<{ success: boolean; error?: string }> => {
    if (!firestore || !activeSpaceId) {
      return { success: false, error: 'Not ready' };
    }

    try {
      await updateDoc(doc(firestore, 'spaces', activeSpaceId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [firestore, activeSpaceId]);

  const isOwner = useMemo(() => {
    return activeSpace?.ownerId === user?.uid;
  }, [activeSpace, user]);

  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === activeChannelId) || null;
  }, [channels, activeChannelId]);

  return {
    spaces,
    mySpaces,
    loading,
    error,
    activeSpaceId,
    setActiveSpaceId,
    activeSpace,
    categories,
    channels,
    roles,
    members,
    activeChannelId,
    setActiveChannelId,
    activeChannel,
    messages,
    isOwner,
    createSpace,
    joinSpaceByInvite,
    leaveSpace,
    deleteSpace,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    createCategory,
    deleteCategory,
    createChannel,
    updateChannel,
    deleteChannel,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    removeRole,
    updateSpaceSettings,
    PermissionFlags,
  };
}
