
'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PublicUser, useConnections, Connection } from '@/hooks/use-connections';
import { useUser, UserProfile } from '@/hooks/use-user';
import {
  MessageSquare,
  User,
  UserPlus,
  Loader2,
  Users,
  MoreHorizontal,
  UserCheck,
  Clock,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface UserPopoverProps {
  user: PublicUser;
  children: React.ReactNode;
}

export default function UserPopover({ user: targetUser, children }: UserPopoverProps) {
  const { user: currentUser } = useUser();
  const { connections, sendFriendRequest, acceptFriendRequest, removeConnection, loading: connectionsLoading } = useConnections();
  const { toast } = useToast();
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);

  const connectionStatus = useMemo(() => {
    if (!currentUser || !targetUser || currentUser.uid === targetUser.id) return 'self';
    const connection = connections.find(c => c.id === targetUser.id);
    if (!connection) return 'not_connected';
    return connection.status;
  }, [connections, currentUser, targetUser]);

  const handleSendRequest = async () => {
      if (!targetUser) return;
      setActionLoading(true);
      try {
          await sendFriendRequest(targetUser.id);
          toast({ title: 'Success', description: 'Friend request sent.'});
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
          setActionLoading(false);
      }
  }

  const renderConnectionButton = () => {
    if (connectionsLoading) return <Skeleton className="h-9 w-24" />;

    const connection = connections.find(c => c.id === targetUser?.id);

    switch (connectionStatus) {
        case 'friends':
            return <Button size="sm" variant="secondary" disabled><UserCheck className="mr-2 h-4 w-4"/> Friends</Button>;
        case 'pending':
             return <Button size="sm" variant="secondary" disabled><Clock className="mr-2 h-4 w-4"/> Pending</Button>;
        case 'not_connected':
            return <Button size="sm" onClick={handleSendRequest} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <UserPlus className="mr-2 h-4 w-4"/>}
                    Add Friend
                </Button>;
        case 'self':
            return null;
        default:
            return null;
    }
  }
  
  if (!targetUser || currentUser?.uid === targetUser.id) return <>{children}</>;

  return (
    <Popover>
       <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
          {children}
       </PopoverTrigger>
      <PopoverContent className="w-80 border-primary/20 p-0" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarImage src={targetUser.photoURL || undefined} />
              <AvatarFallback>{targetUser.displayName?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-headline text-glow">
                {targetUser.displayName}
              </h3>
              <p className="text-sm text-muted-foreground">@{targetUser.username}</p>
            </div>
          </div>
          <div className="mt-4 text-xs space-y-1 text-muted-foreground">
             <p className="flex items-center gap-2"><Users className="w-4 h-4"/> N/A Mutual Friends</p>
             <p className="flex items-center gap-2"><Users className="w-4 h-4"/> N/A Mutual Spaces</p>
          </div>
        </div>

        <div className="border-t border-border p-2 flex items-center gap-2">
             <Button className="flex-1" size="sm" asChild>
                <Link href={`/chat?contactId=${targetUser.id}`}>
                    <MessageSquare className="mr-2 h-4 w-4"/> Message
                </Link>
            </Button>
            {renderConnectionButton()}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/profile/${targetUser.id}`)}>View Full Profile</DropdownMenuItem>
                    <DropdownMenuItem disabled>Invite to Space</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled>Block User</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </PopoverContent>
    </Popover>
  );
}
