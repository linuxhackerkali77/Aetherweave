import { Timestamp } from 'firebase/firestore';
import { PublicUser } from '@/hooks/use-connections';

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

export const aetherBotContact: Contact = {
    id: 'aether-bot',
    name: 'Aether',
    avatar: '',
    status: 'Online',
    type: 'bot',
};