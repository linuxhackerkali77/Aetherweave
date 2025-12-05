'use client';
import React from 'react';
import { Bell, Search, Compass, Plus, VolumeX, Edit, LogOut, Check, Settings, FolderPlus, Hash, Users, Loader2 } from 'lucide-react';
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
import { useSpaces, Space } from '@/hooks/use-spaces';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const toolIcons = [
  { id: 'add', name: 'Add a Space', icon: Plus, action: 'create-join-space' },
  { id: 'explore', name: 'Explore Spaces', icon: Compass },
];

export default function GamingNavbar() {
  const { openHub, openModal } = useCommandHub();
  const { toast } = useToast();
  const { profile } = useUser();
  const { 
    spaces, 
    loading, 
    activeSpaceId, 
    setActiveSpaceId, 
    isOwner,
    leaveSpace,
    createCategory,
  } = useSpaces();

  const handleSpaceContextMenu = (e: React.MouseEvent, space: Space) => {
    e.preventDefault();
    e.stopPropagation();

    const spaceIsOwned = space.ownerId === profile?.id;

    const actions: any[] = [
      { label: 'Invite People', icon: 'Users', onClick: () => openModal('invite-people', space) },
      { label: 'Mark As Read', icon: 'Check', onClick: () => toast({title: `${space.name} marked as read.`}) },
      { label: 'Mute Space', icon: 'VolumeX', onClick: () => toast({title: `Muted ${space.name}`, description: "You will no longer receive notifications from this space."}) },
      { label: 'Copy Invite Code', icon: 'Copy', onClick: () => {
        navigator.clipboard.writeText(space.inviteCode || '');
        toast({ title: 'Invite code copied!', description: space.inviteCode });
      }},
    ];

    if (spaceIsOwned) {
      actions.push(
        { separator: true },
        { label: 'Create Category', icon: 'FolderPlus', onClick: async () => {
          const result = await createCategory('New Category');
          if (result.success) {
            toast({title: 'Category created.'});
          }
        }},
        { label: 'Space Settings', icon: 'Settings', onClick: () => openModal('space-settings', space) }
      );
    }

    actions.push(
      { separator: true },
      { label: spaceIsOwned ? 'Delete Space' : 'Leave Space', icon: 'LogOut', onClick: async () => {
        if (!spaceIsOwned) {
          const result = await leaveSpace(space.id);
          if (result.success) {
            toast({ title: 'Left Space', description: `You have left ${space.name}.` });
          } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
          }
        }
      }, isDestructive: true }
    );

    openHub(e, {
      type: 'space-context',
      data: space,
      actions: actions
    });
  };
    
  const handleToolClick = (tool: typeof toolIcons[0]) => {
    if (tool.action) {
      openModal(tool.action as any);
    } else {
      toast({ title: 'Coming Soon!', description: `${tool.name} functionality is under development.`});
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-6 border-b-2 border-primary/20 bg-background/80 px-6 backdrop-blur-sm shadow-md">
      <nav className="flex items-center gap-3">
        <TooltipProvider>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading spaces...</span>
            </div>
          ) : spaces.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm">No spaces yet</span>
            </div>
          ) : (
            spaces.map((space) => (
              <Tooltip key={space.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveSpaceId(space.id)}
                    onContextMenu={(e) => handleSpaceContextMenu(e, space)}
                    data-command-hub-trigger
                    className="group relative h-12 w-12 rounded-full flex items-center justify-center bg-muted/50 transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none"
                  >
                    {space.iconUrl ? (
                      <Avatar className="h-full w-full">
                        <AvatarImage src={space.iconUrl} alt={space.name} className="object-cover rounded-full transition-all duration-200 group-hover:rounded-xl" />
                        <AvatarFallback className="rounded-full group-hover:rounded-xl transition-all duration-200 bg-primary/20 text-primary font-bold">
                          {space.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={cn(
                        "flex h-full w-full items-center justify-center rounded-full transition-all duration-200 group-hover:rounded-xl font-bold text-lg",
                        activeSpaceId === space.id ? "bg-primary/30 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {space.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {activeSpaceId === space.id && (
                      <motion.div
                        layoutId="active-space-underline"
                        className="absolute -bottom-2 h-1 w-10 rounded-full bg-primary neon-glow-primary"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{space.name}</p>
                  {space.memberCount && <p className="text-xs text-muted-foreground">{space.memberCount} members</p>}
                </TooltipContent>
              </Tooltip>
            ))
          )}
          
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
