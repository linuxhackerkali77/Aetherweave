
'use client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Gift,
  FileArchive,
  Smile,
  Send,
  Loader2,
  Copy,
  Trash2,
  MessageSquareReply,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, UserProfile } from '@/hooks/use-user';
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useCommandHub } from '@/hooks/use-command-hub';
import { useToast } from '@/hooks/use-toast';
import { useConnections, PublicUser } from '@/hooks/use-connections';
import UserPopover from '@/components/user/user-popover';

interface Message {
    id: number;
    userId: string;
    content: string;
    timestamp: string;
    sender: {
        username: string;
        avatar?: string;
    }
}

export default function GamingChatArea() {
    const { user, profile } = useUser();
    const { users } = useConnections();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { openHub } = useCommandHub();
    const { toast } = useToast();

    const messageUsers = useMemo(() => {
        const userMap = new Map<string, PublicUser>();
        users.forEach(u => userMap.set(u.id, u));
        if (profile && user) {
            userMap.set(user.uid, profile as PublicUser);
        }
        return userMap;
    }, [users, profile, user]);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleDeleteMessage = (messageId: number) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        toast({ title: "Message Deleted" });
    }

    const handleMessageContextMenu = (e: React.MouseEvent, message: Message) => {
        e.preventDefault();
        e.stopPropagation();

        openHub(e, {
            type: 'gaming-chat-message',
            data: message,
            actions: [
                { label: 'Reply', icon: 'MessageSquareReply', onClick: () => {} },
                { label: 'Copy Text', icon: 'Copy', onClick: () => {
                    navigator.clipboard.writeText(message.content);
                    toast({ title: "Copied!" });
                }},
                { label: 'Add Reaction', icon: 'Smile', onClick: () => {} },
                ...(message.userId === user?.uid ? [{
                    label: 'Delete Message',
                    icon: 'Trash2' as const,
                    onClick: () => handleDeleteMessage(message.id),
                }] : []),
            ]
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user) return;
        
        setIsLoading(true);

        const newMessage: Message = {
            id: Date.now(),
            userId: user.uid,
            content: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: {
                username: profile?.gaming?.username || profile?.displayName || 'Operator',
                avatar: profile?.photoURL,
            }
        };

        // Simulate network delay
        setTimeout(() => {
            setMessages(prev => [...prev, newMessage]);
            setInput('');
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="flex flex-1 flex-col bg-muted/50 border rounded-lg">
            <ScrollArea className="flex-1 custom-scroll" ref={scrollAreaRef}>
                 <div className="p-6 space-y-6">
                    <AnimatePresence>
                        {messages.map(msg => {
                             const isOwnMessage = msg.userId === user?.uid;
                             const senderProfile = messageUsers.get(msg.userId);

                            return (
                            <motion.div 
                                key={msg.id} 
                                className={cn("group flex items-start gap-4", isOwnMessage && "justify-end")}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                layout
                                onContextMenu={(e) => handleMessageContextMenu(e, msg)}
                                data-command-hub-trigger
                            >
                                {!isOwnMessage && senderProfile && (
                                    <UserPopover user={senderProfile}>
                                        <Avatar className="h-10 w-10 cursor-pointer">
                                            <AvatarImage src={msg.sender.avatar} />
                                            <AvatarFallback>{msg.sender.username?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </UserPopover>
                                )}
                                <div className={cn("flex flex-col", isOwnMessage && "items-end")}>
                                    <div className="flex items-baseline gap-2">
                                        {!isOwnMessage && senderProfile ? (
                                            <UserPopover user={senderProfile}>
                                                <p className="font-bold text-primary cursor-pointer hover:underline">{msg.sender.username}</p>
                                            </UserPopover>
                                        ) : !isOwnMessage && <p className="font-bold text-primary">{msg.sender.username}</p>}
                                        <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-lg max-w-md",
                                        isOwnMessage ? "bg-primary text-primary-foreground" : "bg-background"
                                    )}>
                                        <p>{msg.content}</p>
                                    </div>
                                </div>
                                 {isOwnMessage && senderProfile && (
                                     <UserPopover user={senderProfile}>
                                        <Avatar className="h-10 w-10 cursor-pointer">
                                            <AvatarImage src={msg.sender.avatar} />
                                            <AvatarFallback>{msg.sender.username?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                     </UserPopover>
                                )}
                            </motion.div>
                        )})}
                    </AnimatePresence>
                 </div>
            </ScrollArea>
            <div className="p-4 border-t">
                 <form className="relative" onSubmit={handleSubmit}>
                    <Button variant="ghost" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground">
                        <PlusCircle />
                    </Button>
                    <Input
                        placeholder="Message #general"
                        className="bg-input pl-12 pr-24 text-base"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Smile /></Button>
                         <Button size="icon" type="submit" className="ml-2 w-8 h-8" disabled={isLoading || !input.trim()}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
