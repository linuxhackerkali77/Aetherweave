'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Crown, Sword, User, Shield, Loader2 } from 'lucide-react';
import React from 'react';
import { useCommandHub } from '@/hooks/use-command-hub';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { useConnections, PublicUser } from '@/hooks/use-connections';
import { useSpaces, SpaceMember, SpaceRole } from '@/hooks/use-spaces';
import UserPopover from '@/components/user/user-popover';

interface MemberWithRole extends SpaceMember {
  highestRole?: SpaceRole;
  roleColor?: string;
}

const MemberItem = ({ 
  member, 
  isOnline, 
  isOwner,
  isModerator,
  roleColor,
}: { 
  member: SpaceMember;
  isOnline: boolean;
  isOwner?: boolean;
  isModerator?: boolean;
  roleColor?: string;
}) => {
  const { openHub } = useCommandHub();
  const router = useRouter();
  const { toast } = useToast();
  const { sendFriendRequest, connections } = useConnections();
  const { user: currentUser } = useUser();
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  
  const isSelf = currentUser?.uid === member.oderId;

  React.useEffect(() => {
    if(isOnline && Math.random() > 0.8) {
      const interval = setInterval(() => {
        setIsSpeaking(prev => !prev);
      }, 2000 + Math.random() * 3000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSelf) return;

    const isFriend = connections.some(c => c.id === member.oderId && c.status === 'friends');
    const isPending = connections.some(c => c.id === member.oderId && c.status === 'pending');

    openHub(e, {
      type: 'gaming-member',
      data: member,
      actions: [
        { label: 'View Profile', icon: 'User', onClick: () => router.push(`/profile/${member.oderId}`) },
        { label: 'Mention', icon: 'AtSign', onClick: () => toast({ title: `Mentioned @${member.odername}` }) },
        { label: 'Message', icon: 'MessageSquare', onClick: () => router.push(`/chat?contactId=${member.oderId}`) },
        { label: 'Add Friend', icon: 'UserPlus', onClick: () => sendFriendRequest(member.oderId), disabled: isFriend || isPending },
        { separator: true } as any,
        { label: 'Set Volume', icon: 'Volume2', onClick: () => {}, disabled: !isOnline },
        { separator: true } as any,
        { label: 'Kick', icon: 'LogOut', onClick: () => toast({ title: 'Coming soon!' }), disabled: !isOwner && !isModerator },
        { label: 'Ban', icon: 'Gavel', onClick: () => toast({ title: 'Coming soon!' }), isDestructive: true, disabled: !isOwner },
      ]
    });
  };

  const publicUser: PublicUser = {
    id: member.oderId,
    username: member.odername,
    displayName: member.odername,
    email: null,
    photoURL: null,
  };

  return (
    <UserPopover user={publicUser}>
      <div 
        className="flex items-center gap-3 p-1.5 rounded-md hover:bg-accent/50 cursor-pointer group transition-colors"
        onContextMenu={handleContextMenu}
        data-command-hub-trigger
      >
        <div className="relative">
          <Avatar className={cn(
            "h-9 w-9 transition-all",
            isSpeaking && "ring-2 ring-green-400 ring-offset-2 ring-offset-background"
          )}>
            <AvatarFallback className={cn(
              "text-sm font-medium",
              !isOnline && 'opacity-50'
            )}>{member.odername?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500" />
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className={cn(
            'font-medium text-sm truncate flex items-center gap-1.5',
            roleColor && `text-[${roleColor}]`,
            isOwner && 'text-amber-400',
            isModerator && !isOwner && 'text-blue-400'
          )}>
            {isOwner && <Crown size={12} className="flex-shrink-0" />}
            {isModerator && !isOwner && <Shield size={12} className="flex-shrink-0" />}
            {member.odername}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
    </UserPopover>
  );
};

export default function GamingMemberList() {
  const { user, profile } = useUser();
  const { 
    activeSpace, 
    members, 
    roles,
    loading,
  } = useSpaces();

  const { owner, moderators, onlineMembers } = React.useMemo(() => {
    if (!activeSpace) {
      return { owner: null, moderators: [], onlineMembers: [] };
    }

    let owner: SpaceMember | null = null;
    const moderators: SpaceMember[] = [];
    const online: SpaceMember[] = [];

    members.forEach(member => {
      if (member.role === 'owner' || member.oderId === activeSpace.ownerId) {
        owner = member;
      } else if (member.roles?.includes('moderator') || member.role === 'moderator') {
        moderators.push(member);
      } else {
        online.push(member);
      }
    });

    return { owner, moderators, onlineMembers: online };
  }, [activeSpace, members]);

  const memberGroups: { [key: string]: { members: SpaceMember[]; isOwner?: boolean; isModerator?: boolean } } = {};

  if (owner) {
    memberGroups['OWNER'] = { members: [owner], isOwner: true };
  }
  if (moderators.length > 0) {
    memberGroups['MODERATORS'] = { members: moderators, isModerator: true };
  }
  if (onlineMembers.length > 0) {
    memberGroups['MEMBERS'] = { members: onlineMembers };
  }

  const totalMembers = members.length;

  if (loading) {
    return (
      <div className="hidden w-64 flex-col bg-muted/30 backdrop-blur-sm lg:flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeSpace) {
    return (
      <div className="hidden w-64 flex-col bg-muted/30 backdrop-blur-sm lg:flex">
        <header className="flex h-16 shrink-0 items-center border-b border-primary/20 px-4 shadow-md">
          <h2 className="text-lg font-bold">Members</h2>
        </header>
        <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-4">
          <p>Select a space to see members</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden w-64 flex-col bg-muted/30 backdrop-blur-sm lg:flex">
      <header className="flex h-16 shrink-0 items-center border-b border-primary/20 px-4 shadow-md">
        <h2 className="text-lg font-bold">Members - {totalMembers}</h2>
      </header>
      <ScrollArea className="flex-1 p-3 custom-scroll">
        {totalMembers === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
            <User className="w-12 h-12 mb-4" />
            <h3 className="font-headline text-lg">No Members</h3>
            <p className="text-sm">This space is currently empty.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(memberGroups).map(([group, { members: groupMembers, isOwner, isModerator }]) => (
              groupMembers.length > 0 && (
                <div key={group}>
                  <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    {group} - {groupMembers.length}
                  </h3>
                  <div className="space-y-1">
                    {groupMembers.map(member => (
                      <MemberItem 
                        key={member.oderId} 
                        member={member} 
                        isOnline={true}
                        isOwner={isOwner}
                        isModerator={isModerator}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
