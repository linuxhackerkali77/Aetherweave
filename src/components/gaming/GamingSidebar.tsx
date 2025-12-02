
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
  User,
  MessageCircle,
  BellOff,
  UserPlus,
  Check,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useCommandHub } from '@/hooks/use-command-hub';
import { useToast } from '@/hooks/use-toast';

const channels = [
    { id: 'c1', name: '👋 welcome', category: 'INFO', type: 'text' },
    { id: 'c2', name: '📢 announcements', category: 'INFO', type: 'announcement' },
    { id: 'c3', name: '🚀 updates', category: 'INFO', type: 'feed' },
    { id: 'c4', name: '# general', category: 'TEXT CHANNELS', type: 'text' },
    { id: 'c5', name: '# off-topic', category: 'TEXT CHANNELS', type: 'text' },
    { id: 'c6', name: '# showcase', category: 'TEXT CHANNELS', type: 'text' },
    { id: 'c7', name: '🔊 Lobby', category: 'VOICE CHANNELS', type: 'voice' },
    { id: 'c8', name: '🔊 Squad 1', category: 'VOICE CHANNELS', type: 'voice' },
    { id: 'c9', name: '🔊 Music', category: 'VOICE CHANNELS', type: 'voice' },
];

const getChannelIcon = (type: string) => {
    switch(type) {
        case 'text': return <Hash size={20} />;
        case 'voice': return <Volume2 size={20} />;
        case 'announcement': return <Megaphone size={20} />;
        case 'feed': return <Rss size={20} />;
        default: return <Hash size={20} />;
    }
}

export default function GamingSidebar() {
  const { user, profile, updateStatus } = useUser();
  const { openHub } = useCommandHub();
  const { toast } = useToast();
  const [activeChannel, setActiveChannel] = React.useState('c4');
  const [activeVoiceChannel, setActiveVoiceChannel] = React.useState<string | null>(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isDeafened, setIsDeafened] = React.useState(false);
  const router = useRouter();

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
      })
  }

  const handleChannelContextMenu = (e: React.MouseEvent, channel: typeof channels[0]) => {
      e.preventDefault();
      e.stopPropagation();

      const isVoice = channel.type === 'voice';
      
      const textChannelActions = [
        { label: 'Mark as Read', icon: 'Check' as const, onClick: () => toast({ title: `Channel "${channel.name}" marked as read.` }) },
        { label: 'Mute Channel', icon: 'BellOff' as const, onClick: () => toast({ title: `Muted "${channel.name}"` }) },
        { label: 'Invite Friends', icon: 'UserPlus' as const, onClick: () => {} },
        { label: 'Channel Settings', icon: 'Settings' as const, onClick: () => {}, disabled: true },
      ];

      const voiceChannelActions = [
         { label: 'Adjust Volume', icon: 'Volume2' as const, onClick: () => {} },
         { label: 'Mute Channel', icon: 'BellOff' as const, onClick: () => toast({ title: `Muted "${channel.name}"` }) },
         { label: 'Invite Friends', icon: 'UserPlus' as const, onClick: () => {} },
         { label: 'Channel Settings', icon: 'Settings' as const, onClick: () => {}, disabled: true },
      ]

      openHub(e, {
          type: 'gaming-channel',
          data: channel,
          actions: isVoice ? voiceChannelActions : textChannelActions,
      })
  }

  const channelCategories = React.useMemo(() => {
    return channels.reduce((acc, channel) => {
        if(!acc[channel.category]) {
            acc[channel.category] = [];
        }
        acc[channel.category].push(channel);
        return acc;
    }, {} as Record<string, typeof channels>);
  }, []);

  const currentVoiceChannel = activeVoiceChannel ? channels.find(c => c.id === activeVoiceChannel) : null;

  return (
    <div className="flex w-64 flex-col bg-muted/30 border-r-2 border-primary/20">
        <div className="flex h-16 items-center border-b-2 border-primary/20 px-4 shadow-md">
          <h1 className="text-lg font-bold font-headline text-glow">Aetherweave Space</h1>
        </div>
        <ScrollArea className="flex-1 px-2 py-4 custom-scroll">
            <Accordion type="multiple" defaultValue={['INFO', 'TEXT CHANNELS', 'VOICE CHANNELS']} className="w-full space-y-2">
                {Object.entries(channelCategories).map(([category, channels]) => (
                    <AccordionItem key={category} value={category} className="border-none">
                         <AccordionTrigger className="px-2 py-1 text-xs font-bold uppercase text-muted-foreground hover:text-foreground hover:no-underline">
                             <span className="text-glow">{category}</span>
                         </AccordionTrigger>
                         <AccordionContent className="pt-1">
                             <div className="space-y-1">
                                 {channels.map(channel => {
                                     const isTextChannel = channel.type !== 'voice';
                                     const isActive = isTextChannel ? channel.id === activeChannel : channel.id === activeVoiceChannel;

                                     const handleClick = () => {
                                        if (isTextChannel) {
                                            setActiveChannel(channel.id)
                                        } else {
                                            handleVoiceChannelClick(channel.id);
                                        }
                                     };

                                     return (
                                        <div
                                          key={channel.id}
                                          className="group relative rounded-md"
                                          onClick={handleClick}
                                          onContextMenu={(e) => handleChannelContextMenu(e, channel)}
                                          data-command-hub-trigger
                                        >
                                            {isTextChannel && isActive && (
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
                                                    isTextChannel && (isActive ? "bg-accent/70 text-foreground" : "hover:bg-accent/50 hover:text-foreground group-hover:translate-x-1"),
                                                    !isTextChannel && (isActive ? "text-green-400" : "hover:bg-accent/50 hover:text-foreground")
                                                )}
                                            >
                                                {getChannelIcon(channel.type)}
                                                <span className="font-semibold">{channel.name}</span>
                                            </div>
                                        </div>
                                     )
                                 })}
                             </div>
                         </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </ScrollArea>
        <div 
            className="flex h-auto flex-col bg-muted/40 p-3 border-t-2 border-primary/20"
            onContextMenu={handleUserPanelContextMenu}
            data-command-hub-trigger
        >
          {currentVoiceChannel && (
            <div className="mb-2 p-2 rounded-md bg-green-500/10 border border-green-500/30">
                <p className="text-sm font-bold text-green-400">Voice Connected</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{currentVoiceChannel.name}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setActiveVoiceChannel(null)}>
                    <PhoneOff size={16}/>
                  </Button>
                </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className='flex items-center gap-2'>
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.photoURL || undefined} />
                <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">{profile?.gaming?.username || profile?.displayName}</p>
                <p className="text-xs text-muted-foreground">{profile?.status || 'Online'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsMuted(!isMuted)}> 
                <Mic size={20} className={cn(isMuted && "text-destructive")} /> 
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsDeafened(!isDeafened)}> 
                <Headphones size={20} className={cn(isDeafened && "text-destructive")} /> 
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => router.push('/settings')}> 
                <Settings size={20} /> 
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
}
