'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Mic,
  Headphones,
  Settings,
  Hash,
  Volume2,
  Megaphone,
  Rss,
  PhoneOff,
  Plus,
  ChevronDown,
  ChevronRight,
  Radio,
  Loader2,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommandHub } from '@/hooks/use-command-hub';
import { useToast } from '@/hooks/use-toast';
import { useSpaces, SpaceChannel, SpaceCategory } from '@/hooks/use-spaces';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getChannelIcon = (type: string) => {
  switch(type) {
    case 'text': return <Hash size={18} />;
    case 'voice': return <Volume2 size={18} />;
    case 'announcement': return <Megaphone size={18} />;
    case 'feed': return <Rss size={18} />;
    case 'stage': return <Radio size={18} />;
    default: return <Hash size={18} />;
  }
}

export default function GamingSidebar() {
  const { user, profile, updateStatus } = useUser();
  const { openHub, openModal } = useCommandHub();
  const { toast } = useToast();
  const router = useRouter();
  
  const {
    spaces,
    loading,
    activeSpace,
    activeSpaceId,
    setActiveSpaceId,
    categories,
    channels,
    activeChannelId,
    setActiveChannelId,
    isOwner,
    createChannel,
    createCategory,
    deleteChannel,
    leaveSpace,
    deleteSpace,
  } = useSpaces();

  const [activeVoiceChannel, setActiveVoiceChannel] = React.useState<string | null>(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isDeafened, setIsDeafened] = React.useState(false);
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set());
  
  const [createChannelOpen, setCreateChannelOpen] = React.useState(false);
  const [newChannelName, setNewChannelName] = React.useState('');
  const [newChannelType, setNewChannelType] = React.useState<SpaceChannel['type']>('text');
  const [newChannelCategory, setNewChannelCategory] = React.useState<string>('');
  const [isCreatingChannel, setIsCreatingChannel] = React.useState(false);

  const handleVoiceChannelClick = (channelId: string) => {
    setActiveVoiceChannel(prev => prev === channelId ? null : channelId);
  }

  const handleUserPanelContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    openHub(e, {
      type: 'gaming-user-panel',
      actions: [
        { label: 'Online', icon: 'Circle', onClick: () => updateStatus('Online')},
        { label: 'Away', icon: 'Clock', onClick: () => updateStatus('Away')},
        { label: 'Do Not Disturb', icon: 'MinusCircle', onClick: () => updateStatus('Do Not Disturb')},
        { label: 'Invisible', icon: 'CircleOff', onClick: () => updateStatus('Invisible')},
      ]
    });
  }

  const handleChannelContextMenu = (e: React.MouseEvent, channel: SpaceChannel) => {
    e.preventDefault();
    e.stopPropagation();

    const isVoice = channel.type === 'voice' || channel.type === 'stage';
    
    const baseActions = [
      { label: 'Mark as Read', icon: 'Check' as const, onClick: () => toast({ title: `Channel "#${channel.name}" marked as read.` }) },
      { label: 'Mute Channel', icon: 'BellOff' as const, onClick: () => toast({ title: `Muted "#${channel.name}"` }) },
      { label: 'Copy Channel ID', icon: 'Copy' as const, onClick: () => {
        navigator.clipboard.writeText(channel.id);
        toast({ title: 'Channel ID copied!' });
      }},
    ];

    if (isOwner) {
      baseActions.push(
        { separator: true } as any,
        { label: 'Edit Channel', icon: 'Settings' as const, onClick: () => toast({ title: 'Channel settings coming soon!' }) },
        { label: 'Delete Channel', icon: 'Trash' as const, onClick: () => handleDeleteChannel(channel.id), isDestructive: true },
      );
    }

    openHub(e, {
      type: 'gaming-channel',
      data: channel,
      actions: baseActions,
    });
  }

  const handleCategoryContextMenu = (e: React.MouseEvent, category: SpaceCategory) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isOwner) return;

    openHub(e, {
      type: 'gaming-category',
      data: category,
      actions: [
        { label: 'Create Channel', icon: 'Plus' as const, onClick: () => {
          setNewChannelCategory(category.id);
          setCreateChannelOpen(true);
        }},
        { label: 'Edit Category', icon: 'Edit' as const, onClick: () => toast({ title: 'Category editing coming soon!' }) },
        { separator: true },
        { label: 'Delete Category', icon: 'Trash' as const, onClick: () => toast({ title: 'Category deletion coming soon!' }), isDestructive: true },
      ],
    });
  }

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast({ variant: 'destructive', title: 'Channel name is required' });
      return;
    }
    setIsCreatingChannel(true);
    try {
      const result = await createChannel(newChannelName.trim(), newChannelType, newChannelCategory || undefined);
      if (result.success) {
        toast({ title: 'Channel Created', description: `#${newChannelName} has been created.` });
        setCreateChannelOpen(false);
        setNewChannelName('');
        setNewChannelType('text');
        setNewChannelCategory('');
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to create channel' });
      }
    } finally {
      setIsCreatingChannel(false);
    }
  }

  const handleLeaveSpace = async () => {
    if (!activeSpaceId) return;
    const result = await leaveSpace(activeSpaceId);
    if (result.success) {
      toast({ title: 'Left Space', description: 'You have left the space.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to leave space' });
    }
  }

  const handleDeleteSpace = async () => {
    if (!activeSpaceId) return;
    const result = await deleteSpace(activeSpaceId);
    if (result.success) {
      toast({ title: 'Space Deleted', description: 'The space has been deleted.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to delete space' });
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    const result = await deleteChannel(channelId);
    if (result.success) {
      toast({ title: 'Channel Deleted' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to delete channel' });
    }
  }

  const channelsByCategory = React.useMemo(() => {
    const grouped: Record<string, SpaceChannel[]> = { uncategorized: [] };
    
    categories.forEach(cat => {
      grouped[cat.id] = [];
    });

    channels.forEach(channel => {
      if (channel.categoryId && grouped[channel.categoryId]) {
        grouped[channel.categoryId].push(channel);
      } else {
        grouped.uncategorized.push(channel);
      }
    });

    return grouped;
  }, [categories, channels]);

  const currentVoiceChannel = activeVoiceChannel ? channels.find(c => c.id === activeVoiceChannel) : null;

  if (loading) {
    return (
      <div className="flex w-64 flex-col bg-muted/30 border-r-2 border-primary/20 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading spaces...</p>
      </div>
    );
  }

  if (!activeSpace) {
    return (
      <div className="flex w-64 flex-col bg-muted/30 border-r-2 border-primary/20">
        <div className="flex h-16 items-center border-b-2 border-primary/20 px-4 shadow-md">
          <h1 className="text-lg font-bold font-headline text-glow">No Space Selected</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-muted-foreground mb-4">Join or create a space to get started!</p>
          <Button onClick={() => openModal('create-join-space')} className="neon-border-primary">
            <Plus size={16} className="mr-2" />
            Create or Join Space
          </Button>
        </div>
        <UserPanel 
          profile={profile}
          isMuted={isMuted}
          isDeafened={isDeafened}
          setIsMuted={setIsMuted}
          setIsDeafened={setIsDeafened}
          onContextMenu={handleUserPanelContextMenu}
          onSettingsClick={() => router.push('/settings')}
        />
      </div>
    );
  }

  return (
    <div className="flex w-64 flex-col bg-muted/30 border-r-2 border-primary/20">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex h-16 items-center border-b-2 border-primary/20 px-4 shadow-md cursor-pointer hover:bg-accent/30 transition-colors">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold font-headline text-glow truncate">{activeSpace.name}</h1>
              <p className="text-xs text-muted-foreground">{activeSpace.memberCount || 1} members</p>
            </div>
            <ChevronDown size={18} className="text-muted-foreground flex-shrink-0" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 glass-card">
          <DropdownMenuItem onClick={() => openModal('invite-people', activeSpace)}>
            <Plus size={16} className="mr-2" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            navigator.clipboard.writeText(activeSpace.inviteCode || '');
            toast({ title: 'Invite code copied!', description: activeSpace.inviteCode });
          }}>
            <Hash size={16} className="mr-2" />
            Copy Invite Code
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openModal('space-settings', activeSpace)}>
                <Settings size={16} className="mr-2" />
                Space Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreateChannelOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Channel
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          {isOwner ? (
            <DropdownMenuItem className="text-destructive" onClick={handleDeleteSpace}>
              Delete Space
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem className="text-destructive" onClick={handleLeaveSpace}>
              Leave Space
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ScrollArea className="flex-1 px-2 py-4 custom-scroll">
        <div className="space-y-4">
          {channelsByCategory.uncategorized.length > 0 && (
            <div className="space-y-1">
              {channelsByCategory.uncategorized.map(channel => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={channel.type === 'voice' || channel.type === 'stage' 
                    ? channel.id === activeVoiceChannel 
                    : channel.id === activeChannelId}
                  isVoiceActive={channel.id === activeVoiceChannel}
                  onClick={() => {
                    if (channel.type === 'voice' || channel.type === 'stage') {
                      handleVoiceChannelClick(channel.id);
                    } else {
                      setActiveChannelId(channel.id);
                    }
                  }}
                  onContextMenu={(e) => handleChannelContextMenu(e, channel)}
                />
              ))}
            </div>
          )}

          {categories.map(category => {
            const categoryChannels = channelsByCategory[category.id] || [];
            const isCollapsed = collapsedCategories.has(category.id);

            return (
              <div key={category.id} className="space-y-1">
                <div 
                  className="flex items-center gap-1 px-1 py-1 text-xs font-bold uppercase text-muted-foreground hover:text-foreground cursor-pointer group"
                  onClick={() => toggleCategory(category.id)}
                  onContextMenu={(e) => handleCategoryContextMenu(e, category)}
                  data-command-hub-trigger
                >
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  <span className="text-glow flex-1">{category.name}</span>
                  {isOwner && (
                    <Plus 
                      size={14} 
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewChannelCategory(category.id);
                        setCreateChannelOpen(true);
                      }}
                    />
                  )}
                </div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5">
                        {categoryChannels.map(channel => (
                          <ChannelItem
                            key={channel.id}
                            channel={channel}
                            isActive={channel.type === 'voice' || channel.type === 'stage'
                              ? channel.id === activeVoiceChannel
                              : channel.id === activeChannelId}
                            isVoiceActive={channel.id === activeVoiceChannel}
                            onClick={() => {
                              if (channel.type === 'voice' || channel.type === 'stage') {
                                handleVoiceChannelClick(channel.id);
                              } else {
                                setActiveChannelId(channel.id);
                              }
                            }}
                            onContextMenu={(e) => handleChannelContextMenu(e, channel)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {currentVoiceChannel && (
        <div className="mx-2 mb-2 p-2 rounded-md bg-green-500/10 border border-green-500/30">
          <p className="text-sm font-bold text-green-400">Voice Connected</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{currentVoiceChannel.name}</p>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setActiveVoiceChannel(null)}>
              <PhoneOff size={16}/>
            </Button>
          </div>
        </div>
      )}

      <UserPanel 
        profile={profile}
        isMuted={isMuted}
        isDeafened={isDeafened}
        setIsMuted={setIsMuted}
        setIsDeafened={setIsDeafened}
        onContextMenu={handleUserPanelContextMenu}
        onSettingsClick={() => router.push('/settings')}
      />

      <Dialog open={createChannelOpen} onOpenChange={setCreateChannelOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Channel Type</Label>
              <Select value={newChannelType} onValueChange={(v) => setNewChannelType(v as SpaceChannel['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <Hash size={16} /> Text Channel
                    </div>
                  </SelectItem>
                  <SelectItem value="voice">
                    <div className="flex items-center gap-2">
                      <Volume2 size={16} /> Voice Channel
                    </div>
                  </SelectItem>
                  <SelectItem value="announcement">
                    <div className="flex items-center gap-2">
                      <Megaphone size={16} /> Announcement
                    </div>
                  </SelectItem>
                  <SelectItem value="stage">
                    <div className="flex items-center gap-2">
                      <Radio size={16} /> Stage
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Channel Name</Label>
              <Input
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="new-channel"
              />
            </div>
            <div className="space-y-2">
              <Label>Category (Optional)</Label>
              <Select value={newChannelCategory} onValueChange={setNewChannelCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No category</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateChannelOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateChannel} disabled={isCreatingChannel}>
              {isCreatingChannel && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChannelItem({ 
  channel, 
  isActive, 
  isVoiceActive,
  onClick, 
  onContextMenu 
}: { 
  channel: SpaceChannel; 
  isActive: boolean;
  isVoiceActive: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const isVoiceType = channel.type === 'voice' || channel.type === 'stage';

  return (
    <div
      className="group relative rounded-md"
      onClick={onClick}
      onContextMenu={onContextMenu}
      data-command-hub-trigger
    >
      {!isVoiceType && isActive && (
        <motion.div
          layoutId="active-channel-indicator"
          className="absolute -left-2 top-0 h-full w-1 rounded-r-full bg-primary"
          initial={false}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <div 
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground transition-all duration-150",
          !isVoiceType && (isActive ? "bg-accent/70 text-foreground" : "hover:bg-accent/50 hover:text-foreground group-hover:translate-x-0.5"),
          isVoiceType && (isVoiceActive ? "text-green-400" : "hover:bg-accent/50 hover:text-foreground")
        )}
      >
        {getChannelIcon(channel.type)}
        <span className="font-medium text-sm truncate">{channel.name}</span>
        {channel.isNsfw && (
          <span className="text-[10px] px-1 rounded bg-destructive/20 text-destructive">NSFW</span>
        )}
      </div>
    </div>
  );
}

function UserPanel({
  profile,
  isMuted,
  isDeafened,
  setIsMuted,
  setIsDeafened,
  onContextMenu,
  onSettingsClick,
}: {
  profile: any;
  isMuted: boolean;
  isDeafened: boolean;
  setIsMuted: (v: boolean) => void;
  setIsDeafened: (v: boolean) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onSettingsClick: () => void;
}) {
  return (
    <div 
      className="flex h-auto flex-col bg-muted/40 p-3 border-t-2 border-primary/20"
      onContextMenu={onContextMenu}
      data-command-hub-trigger
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={profile?.photoURL || undefined} />
            <AvatarFallback>{profile?.displayName?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{profile?.gaming?.username || profile?.displayName || 'User'}</p>
            <p className="text-xs text-muted-foreground">{profile?.status || 'Online'}</p>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsMuted(!isMuted)}> 
            <Mic size={20} className={cn(isMuted && "text-destructive")} /> 
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsDeafened(!isDeafened)}> 
            <Headphones size={20} className={cn(isDeafened && "text-destructive")} /> 
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onSettingsClick}> 
            <Settings size={20} /> 
          </Button>
        </div>
      </div>
    </div>
  );
}
