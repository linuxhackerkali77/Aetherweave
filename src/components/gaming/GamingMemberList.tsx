
'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Crown, Sword, User } from 'lucide-react';
import React from 'react';
import { useCommandHub } from '@/hooks/use-command-hub';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser, UserProfile } from '@/hooks/use-user';
import { useConnections, PublicUser } from '@/hooks/use-connections';
import UserPopover from '@/components/user/user-popover';

const MemberItem = ({ member, isOnline, isOwner }: { member: PublicUser, isOnline: boolean, isOwner?: boolean }) => {
    const { openHub } = useCommandHub();
    const router = useRouter();
    const { toast } = useToast();
    const { sendFriendRequest, connections } = useConnections();
    const { user: currentUser } = useUser();
    const [isSpeaking, setIsSpeaking] = React.useState(false);
    
    // This is mock data, replace with real gaming status
    const gamingStatus = {
        isInGame: Math.random() > 0.7,
        game: 'Cyberpunk 2077',
        status: 'Online',
    };
    const isInGame = gamingStatus.isInGame;

    const isFriend = connections.some(c => c.id === member.id && c.status === 'friends');
    const isPending = connections.some(c => c.id === member.id && c.status === 'pending');
    const isSelf = currentUser?.uid === member.id;

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

        openHub(e, {
            type: 'gaming-member',
            data: member,
            actions: [
                { label: 'View Profile', icon: 'User', onClick: () => router.push(`/profile/${member.id}`) },
                { label: 'Mention', icon: 'AtSign', onClick: () => toast({ title: `Mentioned ${member.displayName}` }) },
                { label: 'Message', icon: 'MessageSquare', onClick: () => router.push(`/chat?contactId=${member.id}`) },
                { label: 'Add Friend', icon: 'UserPlus', onClick: () => sendFriendRequest(member.id), disabled: isFriend || isPending },
                { label: 'Set Volume', icon: 'Volume2', onClick: () => {}, disabled: !isOnline },
                { label: 'Kick', icon: 'LogOut', onClick: () => {}, disabled: true },
                { label: 'Ban', icon: 'Gavel', onClick: () => {}, isDestructive: true, disabled: true },
            ]
        })
    }

    return (
        <UserPopover user={member}>
            <div 
                className="flex items-center gap-3 p-1 rounded-md hover:bg-accent/50 cursor-pointer group"
                onContextMenu={handleContextMenu}
                data-command-hub-trigger
            >
                <div className="relative">
                    <Avatar className={cn("h-10 w-10 transition-all", isSpeaking && "border-2 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.7)]")}>
                        <AvatarImage src={member.photoURL || undefined} className={cn(!isOnline && 'filter grayscale')}/>
                        <AvatarFallback>{member.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                        <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-gaming-background",
                            isInGame ? 'bg-purple-500' : 'bg-green-500'
                        )}>
                        {isInGame && <div className="absolute inset-0.5 rounded-full bg-purple-500 animate-pulse"></div>}
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className={cn('font-semibold truncate flex items-center gap-1.5', isOwner && 'text-amber-400')}>
                        {isOwner && <Crown size={14} />}
                        {member.displayName}
                    </p>
                    <div className="text-xs text-gaming-muted-foreground truncate flex items-center gap-1.5">
                    {isOnline && isInGame ? (
                        <>
                            <Sword size={12} className="text-purple-400" />
                            <span>{gamingStatus.game}</span>
                        </>
                    ) : (
                        <span>{isOnline ? gamingStatus.status : 'Offline'}</span>
                    )}
                    </div>
                </div>
            </div>
        </UserPopover>
    )
};

interface GamingMemberListProps {
    activeSpaceId: string | null;
}

export default function GamingMemberList({ activeSpaceId }: GamingMemberListProps) {
    const { user, profile } = useUser();
    const { users: connectedUsers, connections } = useConnections();

    const { owner, onlineMembers, offlineMembers } = React.useMemo(() => {
        const ownerUsername = "mubah3r"; 
        let owner: PublicUser | null = null;
        
        const allMembers = connections
            .filter(c => c.status === 'friends')
            .map(c => connectedUsers.find(u => u.id === c.id))
            .filter((u): u is PublicUser => !!u);
            
        if (profile) {
            allMembers.unshift(profile as PublicUser);
        }

        const uniqueMembers = Array.from(new Map(allMembers.map(item => [item.id, item])).values());
        
        const online: PublicUser[] = [];
        
        const isAetherweaveHQ = activeSpaceId === 'aetherweave-hq';

        uniqueMembers.forEach(member => {
            if (isAetherweaveHQ && member.username?.toLowerCase() === ownerUsername) {
                owner = member;
            } else {
                online.push(member);
            }
        });
        
        return {
            owner,
            onlineMembers: online,
            offlineMembers: [] 
        };

    }, [profile, connections, connectedUsers, activeSpaceId]);

    const memberGroups: { [key: string]: PublicUser[] } = {};

    if (owner) {
        memberGroups['OWNER'] = [owner];
    }
    if (onlineMembers.length > 0) {
        memberGroups['ONLINE'] = onlineMembers;
    }
    if (offlineMembers.length > 0) {
        memberGroups['OFFLINE'] = offlineMembers;
    }

    const totalOnline = (owner ? 1 : 0) + onlineMembers.length;

    return (
        <div className="hidden w-64 flex-col bg-gaming-background-secondary/60 backdrop-blur-sm lg:flex">
             <header className="flex h-16 shrink-0 items-center border-b border-gaming-border px-4 shadow-md">
                <h2 className="text-lg font-bold text-gaming-foreground">Members - {totalOnline} Online</h2>
             </header>
            <ScrollArea className="flex-1 p-3 custom-scroll">
                 {totalOnline === 0 && offlineMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <User className="w-12 h-12 mb-4" />
                        <h3 className="font-headline text-lg">No Members</h3>
                        <p className="text-sm">This space is currently empty.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(memberGroups).map(([group, members]) => (
                            members.length > 0 && <div key={group}>
                                <h3 className="mb-2 text-sm font-bold uppercase text-gaming-muted-foreground">{group}</h3>
                                <div className="space-y-3">
                                    {members.map(member => (
                                        <MemberItem 
                                            key={member.id} 
                                            member={member} 
                                            isOnline={group !== 'OFFLINE'}
                                            isOwner={group === 'OWNER'}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

    