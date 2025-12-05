'use client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Smile,
  Send,
  Loader2,
  Hash,
  Volume2,
  Megaphone,
  Radio,
  Rss,
  MessageSquare,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-user';
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useCommandHub } from '@/hooks/use-command-hub';
import { useToast } from '@/hooks/use-toast';
import { useConnections, PublicUser } from '@/hooks/use-connections';
import { useSpaces, SpaceMessage } from '@/hooks/use-spaces';
import UserPopover from '@/components/user/user-popover';
import { Timestamp } from 'firebase/firestore';

const getChannelIcon = (type: string) => {
  switch(type) {
    case 'text': return <Hash size={20} className="text-muted-foreground" />;
    case 'voice': return <Volume2 size={20} className="text-muted-foreground" />;
    case 'announcement': return <Megaphone size={20} className="text-muted-foreground" />;
    case 'feed': return <Rss size={20} className="text-muted-foreground" />;
    case 'stage': return <Radio size={20} className="text-muted-foreground" />;
    default: return <Hash size={20} className="text-muted-foreground" />;
  }
};

function formatTimestamp(timestamp: Timestamp | undefined): string {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function GamingChatArea() {
  const { user, profile } = useUser();
  const { users } = useConnections();
  const { 
    activeSpace,
    activeChannel, 
    messages, 
    sendMessage, 
    editMessage,
    deleteMessage,
    addReaction,
  } = useSpaces();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
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

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim()) return;
    await editMessage(messageId, editContent);
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleMessageContextMenu = (e: React.MouseEvent, message: SpaceMessage) => {
    e.preventDefault();
    e.stopPropagation();

    const isOwnMessage = message.authorId === user?.uid;

    openHub(e, {
      type: 'gaming-chat-message',
      data: message,
      actions: [
        { label: 'Reply', icon: 'MessageSquareReply', onClick: () => {
          setInput(`@${message.authorUsername} `);
        }},
        { label: 'Copy Text', icon: 'Copy', onClick: () => {
          navigator.clipboard.writeText(message.content);
          toast({ title: "Copied!" });
        }},
        { label: 'Add Reaction', icon: 'Smile', onClick: () => {
          addReaction(message.id, 'heart');
          toast({ title: "Reaction added!" });
        }},
        ...(isOwnMessage ? [
          { separator: true } as any,
          {
            label: 'Edit Message',
            icon: 'Edit' as const,
            onClick: () => {
              setEditingMessageId(message.id);
              setEditContent(message.content);
            },
          },
          {
            label: 'Delete Message',
            icon: 'Trash2' as const,
            onClick: () => handleDeleteMessage(message.id),
            isDestructive: true,
          }
        ] : []),
      ]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !activeChannel) return;
    
    setIsLoading(true);
    try {
      await sendMessage(input.trim());
      setInput('');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeSpace) {
    return (
      <div className="flex flex-1 flex-col bg-muted/50 border rounded-lg items-center justify-center">
        <MessageSquare size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-muted-foreground">No Space Selected</h2>
        <p className="text-muted-foreground mt-2">Select or create a space to start chatting</p>
      </div>
    );
  }

  if (!activeChannel) {
    return (
      <div className="flex flex-1 flex-col bg-muted/50 border rounded-lg items-center justify-center">
        <Hash size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-muted-foreground">No Channel Selected</h2>
        <p className="text-muted-foreground mt-2">Select a channel to start chatting</p>
      </div>
    );
  }

  const isVoiceChannel = activeChannel.type === 'voice' || activeChannel.type === 'stage';

  if (isVoiceChannel) {
    return (
      <div className="flex flex-1 flex-col bg-muted/50 border rounded-lg items-center justify-center">
        <Volume2 size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold">{activeChannel.name}</h2>
        <p className="text-muted-foreground mt-2">Voice channels coming soon!</p>
        <p className="text-xs text-muted-foreground mt-1">Click to join from the sidebar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-muted/50 border rounded-lg">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        {getChannelIcon(activeChannel.type)}
        <h2 className="font-bold">{activeChannel.name}</h2>
        {activeChannel.description && (
          <>
            <div className="w-px h-4 bg-border mx-2" />
            <p className="text-sm text-muted-foreground truncate">{activeChannel.description}</p>
          </>
        )}
      </div>

      <ScrollArea className="flex-1 custom-scroll" ref={scrollAreaRef}>
        <div className="p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {getChannelIcon(activeChannel.type)}
              </div>
              <h3 className="text-xl font-bold">Welcome to #{activeChannel.name}!</h3>
              <p className="text-muted-foreground mt-2">This is the start of the #{activeChannel.name} channel.</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => {
                const isOwnMessage = msg.authorId === user?.uid;
                const senderProfile = messageUsers.get(msg.authorId);
                const prevMessage = messages[index - 1];
                const isGrouped = prevMessage && 
                  prevMessage.authorId === msg.authorId &&
                  msg.createdAt && prevMessage.createdAt &&
                  (msg.createdAt.toMillis() - prevMessage.createdAt.toMillis()) < 5 * 60 * 1000;

                const isEditing = editingMessageId === msg.id;

                return (
                  <motion.div 
                    key={msg.id} 
                    className={cn(
                      "group flex items-start gap-4 hover:bg-accent/30 rounded-md -mx-2 px-2 py-1 transition-colors",
                      isGrouped && "pt-0"
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                    onContextMenu={(e) => handleMessageContextMenu(e, msg)}
                    data-command-hub-trigger
                  >
                    {!isGrouped ? (
                      senderProfile ? (
                        <UserPopover user={senderProfile}>
                          <Avatar className="h-10 w-10 cursor-pointer mt-0.5 flex-shrink-0">
                            <AvatarImage src={msg.authorAvatar || undefined} />
                            <AvatarFallback>{msg.authorUsername?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                        </UserPopover>
                      ) : (
                        <Avatar className="h-10 w-10 mt-0.5 flex-shrink-0">
                          <AvatarImage src={msg.authorAvatar || undefined} />
                          <AvatarFallback>{msg.authorUsername?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                      )
                    ) : (
                      <div className="w-10 flex-shrink-0 flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {!isGrouped && (
                        <div className="flex items-baseline gap-2">
                          {senderProfile ? (
                            <UserPopover user={senderProfile}>
                              <p className={cn(
                                "font-bold cursor-pointer hover:underline",
                                isOwnMessage ? "text-primary" : "text-foreground"
                              )}>{msg.authorUsername}</p>
                            </UserPopover>
                          ) : (
                            <p className={cn(
                              "font-bold",
                              isOwnMessage ? "text-primary" : "text-foreground"
                            )}>{msg.authorUsername}</p>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(msg.createdAt)}
                          </span>
                          {msg.isEdited && (
                            <span className="text-xs text-muted-foreground">(edited)</span>
                          )}
                        </div>
                      )}
                      
                      {isEditing ? (
                        <div className="mt-1 flex gap-2">
                          <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditMessage(msg.id);
                              } else if (e.key === 'Escape') {
                                setEditingMessageId(null);
                                setEditContent('');
                              }
                            }}
                            autoFocus
                          />
                          <Button size="sm" onClick={() => handleEditMessage(msg.id)}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditingMessageId(null);
                            setEditContent('');
                          }}>Cancel</Button>
                        </div>
                      ) : (
                        <p className="text-foreground break-words">{msg.content}</p>
                      )}
                      
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(msg.reactions).map(([emoji, users]) => (
                            <button
                              key={emoji}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                                (users as string[]).includes(user?.uid || '') 
                                  ? "bg-primary/20 border-primary/50" 
                                  : "bg-muted border-border hover:bg-accent"
                              )}
                              onClick={() => {
                                if ((users as string[]).includes(user?.uid || '')) {
                                  toast({ title: "Remove reaction coming soon!" });
                                } else {
                                  addReaction(msg.id, emoji);
                                }
                              }}
                            >
                              <span>{emoji === 'heart' ? '❤️' : emoji}</span>
                              <span>{(users as string[]).length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form className="relative" onSubmit={handleSubmit}>
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <PlusCircle />
          </Button>
          <Input
            placeholder={`Message #${activeChannel.name}`}
            className="bg-input pl-12 pr-24 text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Smile />
            </Button>
            <Button size="icon" type="submit" className="ml-2 w-8 h-8" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
