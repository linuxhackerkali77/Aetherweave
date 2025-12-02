'use client';
import React from 'react';
import { Bell, Search, Compass, Plus, Users, VolumeX, Edit, LogOut, Check, Settings, FolderPlus, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import AetherLogo from '@/components/aether-logo';
import { useCommandHub } from '@/hooks/use-command-hub';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

const spaces: { id: string, name: string, img?: string, icon?: React.ComponentType<any>, mentions?: number, hasUnread?: boolean }[] = [
    { id: 'aetherweave-hq', name: 'Aetherweave HQ', icon: AetherLogo, mentions: 3, hasUnread: true },
];

const toolIcons = [
  { id: 'add', name: 'Add a Space', icon: Plus, action: 'create-join-space' },
  { id: 'explore', name: 'Explore Spaces', icon: Compass },
];

interface GamingNavbarProps {
    activeSpace: string | null;
    setActiveSpace: (id: string | null) => void;
}

export default function GamingNavbar({ activeSpace, setActiveSpace }: GamingNavbarProps) {
    const { openHub, openModal } = useCommandHub();
    const { toast } = useToast();
    const { profile } = useUser();

    const handleSpaceContextMenu = (e: React.MouseEvent, space: typeof spaces[0]) => {
      e.preventDefault();
      e.stopPropagation();

      const isOwner = profile?.username === 'mubah3r' && space.id === 'aetherweave-hq';

      let actions = [
          { label: 'Invite People', icon: 'Users' as const, onClick: () => openModal('invite-people', space) },
          { label: 'Mark As Read', icon: 'Check' as const, onClick: () => toast({title: `${space.name} marked as read.`}) },
          { label: 'Mute Space', icon: 'VolumeX' as const, onClick: () => toast({title: `Muted ${space.name}`, description: "You will no longer receive notifications from this space."}) },
          { label: 'Edit Space Profile', icon: 'Edit' as const, onClick: () => toast({title: 'Per-Space Profile Updated', description: "Your identity for this space has been changed."}) },
      ];

      if (isOwner) {
        actions.push(
          { label: 'Create Category', icon: 'FolderPlus' as const, onClick: () => toast({title: 'Category created.'}) },
          { label: 'Create Channel', icon: 'Hash' as const, onClick: () => toast({title: 'Channel created.'}) },
          { label: 'Server Settings', icon: 'Settings' as const, onClick: () => toast({title: 'Opening Server Settings...'}) }
        );
      } else {
        actions.push({ label: 'Server Settings', icon: 'Settings' as const, onClick: () => {}, disabled: true });
      }

      actions.push({ label: 'Leave Space', icon: 'LogOut' as const, onClick: () => {}, isDestructive: true });

      openHub(e, {
        type: 'space-context',
        data: space,
        actions: actions
      })
    }
    
     const handleToolClick = (tool: typeof toolIcons[0]) => {
        if (tool.action) {
            openModal(tool.action as any);
        } else {
            toast({ title: 'Coming Soon!', description: `${tool.name} functionality is under development.`});
        }
    };


  return (
    <header className="flex h-16 shrink-0 items-center gap-6 border-b-2 border-primary/20 bg-background/80 px-6 backdrop-blur-sm shadow-md">
      {/* Space List */}
      <nav className="flex items-center gap-3">
        <TooltipProvider>
            {spaces.map((space) => (
                 <Tooltip key={space.id}>
                    <TooltipTrigger asChild>
                         <button
                            onClick={() => setActiveSpace(space.id)}
                            onContextMenu={(e) => handleSpaceContextMenu(e, space)}
                            data-command-hub-trigger
                            className="group relative h-12 w-12 rounded-full flex items-center justify-center bg-muted/50 transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none"
                         >
                            {space.img ? (
                              <img src={space.img} alt={space.name} className="h-full w-full object-cover rounded-full transition-all duration-200 group-hover:rounded-xl" />
                            ) : space.icon ? (
                               <div className={cn("flex h-full w-full items-center justify-center rounded-full transition-all duration-200 group-hover:rounded-xl", activeSpace === space.id ? "bg-primary/20" : "")}>
                                <space.icon className="h-8 w-8 text-primary" />
                               </div>
                            ) : null}
                            
                            {/* Notification Badges */}
                            {space.mentions && space.mentions > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold">
                                {space.mentions}
                              </div>
                            )}
                            {space.hasUnread && !space.mentions && (
                               <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                            )}


                            {activeSpace === space.id && (
                                <motion.div
                                    layoutId="active-space-underline"
                                    className="absolute -bottom-2 h-1 w-10 rounded-full bg-primary neon-glow-primary"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}
                         </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>{space.name}</p></TooltipContent>
                 </Tooltip>
            ))}
             <div className="h-8 w-px bg-border mx-2"></div>
              {toolIcons.map((tool) => (
                 <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToolClick(tool)}
                            className="h-12 w-12 rounded-full flex items-center justify-center bg-muted/50 text-muted-foreground transition-all duration-200 hover:scale-110 hover:text-primary hover:bg-muted"
                         >
                            <tool.icon className="h-6 w-6"/>
                         </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>{tool.name}</p></TooltipContent>
                 </Tooltip>
            ))}
        </TooltipProvider>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="w-48 bg-input pl-8"
          />
        </div>
         <Button variant="ghost" size="icon" className="relative h-10 w-10 text-muted-foreground hover:text-foreground">
            <Bell />
        </Button>
      </div>
    </header>
  );
}
