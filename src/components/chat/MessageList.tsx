
'use client';
import { useRef, useEffect, memo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardContent } from '@/components/ui/card';
import { Message, aetherBotContact } from '@/types/chat';
import { User } from 'firebase/auth';
import { motion } from 'framer-motion';
import { cn, copyToClipboard } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Check, CheckCheck, SmilePlus, File as FileIcon, Download, Star } from 'lucide-react';
import { PublicUser } from '@/hooks/use-connections';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCommandHub } from '@/hooks/use-command-hub';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { appEventEmitter } from '@/lib/event-emitter';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { EMOJI_LIST } from '@/lib/data';
import Image from 'next/image';
import UserPopover from '../user/user-popover';

interface MessageListProps {
    messages: Message[];
    currentUser: User | null;
    chatId: string | null;
    connectedUsers: PublicUser[];
}

const formatTime = (timestamp: any) => {
    if (!timestamp) return '...';
    try {
      if (typeof timestamp.toDate === 'function') {
          return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch(e) {
      return '...';
    }
};

const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
        case 'read': return <CheckCheck className="w-4 h-4 text-blue-500" />;
        case 'delivered': return <CheckCheck className="w-4 h-4 text-muted-foreground" />;
        case 'sent': return <Check className="w-4 h-4 text-muted-foreground" />;
        default: return null;
    }
};

const MediaMessage = ({ mediaUrl, mediaType }: { mediaUrl: string, mediaType: string }) => {
    if (mediaType.startsWith('image/')) {
        return (
            <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden my-2 group">
                <Image src={mediaUrl} alt="Chat image" layout="fill" className="object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
        );
    }
    if (mediaType.startsWith('video/')) {
        return (
            <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden my-2">
                <video src={mediaUrl} controls className="w-full h-full" />
            </div>
        );
    }
    return (
        <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 my-2 bg-black/20 rounded-lg hover:bg-black/30">
            <FileIcon className="w-6 h-6" />
            <span className="truncate">Attached File</span>
            <Download className="w-4 h-4 ml-auto" />
        </a>
    )
}

const MemoizedMessage = memo(({ msg, currentUser, handleMessageContextMenu, handleAvatarContextMenu, onReaction, connectedUsers }: { msg: Message, currentUser: User | null, handleMessageContextMenu: (e: React.MouseEvent, m: Message) => void, handleAvatarContextMenu: (e: React.MouseEvent, s: string) => void, onReaction: (messageId: string, emoji: string) => void, connectedUsers: PublicUser[] }) => {
    const isOwnMessage = msg.senderId === currentUser?.uid;
    const sender = connectedUsers.find(u => u.id === msg.senderId);

    return (
        <motion.div
            key={msg.id}
            className="group flex flex-col -mx-2 px-2 py-1 rounded-md hover:bg-muted/30"
            id={`msg-${msg.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onContextMenu={(e) => handleMessageContextMenu(e, msg)}
            data-command-hub-trigger
        >
            <div className={cn("flex items-start gap-3", isOwnMessage ? 'justify-end' : 'justify-start')}>
                {!isOwnMessage && (
                    <div onContextMenu={(e) => handleAvatarContextMenu(e, msg.senderId)} data-command-hub-trigger>
                         <UserPopover user={sender!}>
                            <Avatar className="h-8 w-8 cursor-pointer">
                                {msg.senderId === aetherBotContact.id ? (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full"><Bot className="w-4 h-4 text-primary" /></div>
                                ) : (
                                    <AvatarImage src={msg.senderAvatar || undefined} />
                                )}
                                <AvatarFallback>{msg.senderName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </UserPopover>
                    </div>
                )}
                <div className={cn("flex flex-col space-y-1 text-base max-w-md", isOwnMessage && 'items-end')}>
                     <div className="flex items-center gap-2">
                        {isOwnMessage && (
                             <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="p-1 rounded-full hover:bg-background/50"><SmilePlus size={16} /></button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-1">
                                        <div className="flex gap-1">
                                            {EMOJI_LIST.slice(0, 5).map(emoji => (
                                                <button key={emoji} onClick={() => onReaction(msg.id, emoji)} className="text-2xl p-1 rounded-md hover:bg-muted">{emoji}</button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                             </div>
                        )}
                        <div className={cn("relative px-3 py-2 rounded-lg flex flex-col shadow-md transition-colors",
                            isOwnMessage ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted/80 rounded-bl-none'
                        )}>
                            {!isOwnMessage && (
                                <UserPopover user={sender!}>
                                    <p className="text-xs font-bold text-primary pb-1 cursor-pointer hover:underline">{msg.senderName}</p>
                                </UserPopover>
                            )}
                            {msg.replyTo && (
                                <a href={`#msg-${msg.replyTo}`} className="block border-l-2 border-primary/50 pl-2 mb-2 text-xs opacity-80 hover:bg-black/10 rounded-r-sm">
                                    <p className="font-bold">{msg.replySender}</p>
                                    <p className="line-clamp-1">{msg.replyContent}</p>
                                </a>
                            )}
                            {msg.mediaUrl && msg.mediaType && <MediaMessage mediaUrl={msg.mediaUrl} mediaType={msg.mediaType} />}
                            {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                        </div>
                         {!isOwnMessage && (
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="p-1 rounded-full hover:bg-background/50"><SmilePlus size={16} /></button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-1">
                                        <div className="flex gap-1">
                                            {EMOJI_LIST.slice(0, 5).map(emoji => (
                                                <button key={emoji} onClick={() => onReaction(msg.id, emoji)} className="text-2xl p-1 rounded-md hover:bg-muted">{emoji}</button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                             </div>
                        )}
                    </div>
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex gap-1 pt-1" style={{ marginLeft: isOwnMessage ? 'auto' : '0' }}>
                            {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                <TooltipProvider key={emoji}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                             <button 
                                                onClick={() => onReaction(msg.id, emoji)}
                                                className={cn(
                                                    "px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1 transition-colors",
                                                    userIds.includes(currentUser?.uid ?? '') 
                                                        ? "bg-primary/20 border border-primary/50" 
                                                        : "bg-muted/80 border border-transparent hover:border-primary/50"
                                                )}
                                             >
                                                <span>{emoji}</span>
                                                <span>{userIds.length}</span>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-xs p-1">
                                            {userIds.length} reaction{userIds.length > 1 ? 's' : ''}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground px-1 flex items-center gap-1">
                        <span>{formatTime(msg.timestamp)}</span>
                        {msg.importantFor?.includes(currentUser?.uid ?? '') && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                        {isOwnMessage && getMessageStatusIcon(msg.status)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
MemoizedMessage.displayName = "MemoizedMessage";

export default function MessageList({ messages, currentUser, chatId, connectedUsers }: MessageListProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { openHub } = useCommandHub();
    const { toast } = useToast();
    const { user, profile } = useUser();
    const router = useRouter();
    const firestore = useFirestore();


    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollDiv = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (scrollDiv) {
                // Only autoscroll if user is near the bottom
                const isScrolledToBottom = scrollDiv.scrollHeight - scrollDiv.clientHeight <= scrollDiv.scrollTop + 100;
                if(isScrolledToBottom) {
                    scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: 'smooth' });
                }
            }
        }
    }, [messages]);
    
    const handleDeleteMessage = useCallback(async (messageId: string) => {
        if (!chatId) return;
        const messageRef = doc(firestore, 'chats', chatId, 'messages', messageId);
        try {
            await deleteDoc(messageRef);
        } catch (error) {
            console.error("Error deleting message:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete message.' });
        }
    }, [chatId, firestore, toast]);

    const handleMarkImportant = useCallback(async (messageId: string) => {
        if (!chatId || !currentUser?.uid) return;
        const messageRef = doc(firestore, 'chats', chatId, 'messages', messageId);
        const currentMessage = messages.find(m => m.id === messageId);
        const isImportant = currentMessage?.importantFor?.includes(currentUser.uid) || false;
        
        try {
            await updateDoc(messageRef, {
                importantFor: isImportant 
                    ? arrayRemove(currentUser.uid)
                    : arrayUnion(currentUser.uid)
            });
            toast({ 
                title: isImportant ? 'Removed from important' : 'Marked as important',
                description: isImportant ? 'Message unmarked' : 'Message saved to important'
            });
        } catch (error) {
            console.error('Error marking message as important:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update message.' });
        }
    }, [chatId, currentUser, firestore, messages, toast]);


    const handleMessageContextMenu = (e: React.MouseEvent, message: Message) => {
        e.preventDefault();
        e.stopPropagation();
        
        let messageActions: any[] = [
            { label: 'Reply', icon: 'MessageSquareReply', onClick: () => appEventEmitter.emit('chat:reply-to', message) },
            { label: 'Copy Text', icon: 'Copy', onClick: () => { copyToClipboard(message.content); toast({ title: 'Copied to clipboard' }); } },
            { label: 'Forward', icon: 'ArrowRight', onClick: () => appEventEmitter.emit('chat:forward-message', message) },
            { label: 'Translate', icon: 'Languages', onClick: () => toast({ title: 'Translation feature coming soon' }) },
            { label: 'React', icon: 'SmilePlus', onClick: () => toast({ title: 'Use emoji button to react' }) },
            { label: 'Mark Important', icon: 'Star', onClick: () => handleMarkImportant(message.id) },
        ];

        if (message.senderId === user?.uid) {
            messageActions.push(
                { label: 'Edit Message', icon: 'FilePenLine', onClick: () => toast({ title: 'Edit feature coming soon' }) },
                { label: 'Delete Message', icon: 'Trash2', onClick: () => handleDeleteMessage(message.id) }
            );
        }
        
        openHub(e, {
            type: 'chat-message',
            data: message,
            actions: messageActions,
        });
    };

    const handleAvatarContextMenu = (e: React.MouseEvent, senderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const targetUser = connectedUsers.find(u => u.id === senderId);
        if (!targetUser || senderId === profile?.id) return;

        openHub(e, {
            type: 'user-contact',
            data: targetUser,
            actions: [
                { label: 'Open Profile', icon: 'User', onClick: () => router.push(`/profile/${targetUser.id}`) },
                { label: 'Send Message', icon: 'MessageSquare', onClick: () => router.push(`/chat?contactId=${targetUser.id}`) },
                { label: 'Pin User', icon: 'Pin', onClick: () => appEventEmitter.emit('ui:pin-user', targetUser) },
                { label: 'Block User', icon: 'UserX', onClick: () => console.log("blocking"), isDestructive: true },
            ]
        });
    };

     const handleReaction = useCallback(async (messageId: string, emoji: string) => {
        if (!chatId || !currentUser?.uid) return;

        const messageRef = doc(firestore, 'chats', chatId, 'messages', messageId);
        const currentMessage = messages.find(m => m.id === messageId);
        const currentReactions = currentMessage?.reactions?.[emoji] || [];
        const hasReacted = currentReactions.includes(currentUser.uid);

        try {
            await updateDoc(messageRef, {
                [`reactions.${emoji}`]: hasReacted 
                    ? arrayRemove(currentUser.uid) 
                    : arrayUnion(currentUser.uid)
            });
        } catch(e) {
            console.error("Failed to update reaction", e);
            toast({ variant: 'destructive', title: "Reaction failed" });
        }
    }, [chatId, currentUser, firestore, messages, toast]);


    return (
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <CardContent className="p-4 space-y-1">
                <TooltipProvider>
                    {messages.map((msg) => (
                        <MemoizedMessage
                            key={msg.id}
                            msg={msg}
                            currentUser={currentUser}
                            handleMessageContextMenu={handleMessageContextMenu}
                            handleAvatarContextMenu={handleAvatarContextMenu}
                            onReaction={handleReaction}
                            connectedUsers={connectedUsers}
                        />
                    ))}
                </TooltipProvider>
            </CardContent>
        </ScrollArea>
    );
}
