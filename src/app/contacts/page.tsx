
'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, UserPlus, UserCheck, Clock, UserX, Loader2 } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useConnections, Connection, PublicUser } from '@/hooks/use-connections';
import { useUser } from '@/hooks/use-user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserQuickView from '@/components/user/user-quick-view';
import { useToast } from '@/hooks/use-toast';
import { useCommandHub } from '@/hooks/use-command-hub';
import { useRouter } from 'next/navigation';
import { appEventEmitter } from '@/lib/event-emitter';


export default function ContactsPage() {
  const { user } = useUser();
  const {
    connections,
    users,
    loading,
    findUserByUsername,
    sendFriendRequest,
    acceptFriendRequest,
    removeConnection,
    blockUser
  } = useConnections();
  const { toast } = useToast();
  const { openHub } = useCommandHub();
  const router = useRouter();

  const [usernameSearch, setUsernameSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<PublicUser | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameSearch.trim()) return;

    setIsSearching(true);
    setFoundUser(null);

    const targetUser = await findUserByUsername(usernameSearch);

    if (targetUser) {
      setFoundUser(targetUser);
    } else {
      toast({
        variant: 'destructive',
        title: 'User not found',
        description: `No operator with the username "${usernameSearch}" exists.`,
      });
    }
    setIsSearching(false);
  };

  const getConnectionStatus = (targetUser: PublicUser): { status: Connection['status'] | 'not_connected' | 'self'; connectionId?: string } => {
    if (targetUser.id === user?.uid) return { status: 'self' };
    const connection = connections.find(c => c.id === targetUser.id);
    if (connection) return { status: connection.status, connectionId: connection.id };
    return { status: 'not_connected' };
  };
  
  const handleFoundUserClick = (e: React.MouseEvent, targetUser: PublicUser) => {
    e.preventDefault();
    e.stopPropagation();
    openHub(e, {
        type: 'user-contact',
        data: targetUser,
        actions: [
            { label: 'View Profile', icon: 'User', onClick: () => appEventEmitter.emit('ui:show-user-profile', targetUser.id) },
            { label: 'Add Friend', icon: 'UserPlus', onClick: () => {
                sendFriendRequest(targetUser.id);
                toast({ title: 'Friend Request Sent', description: `Your request has been sent to ${targetUser.username}`});
            }, disabled: getConnectionStatus(targetUser).status !== 'not_connected' },
            { label: 'Block User', icon: 'UserX', onClick: () => {
                blockUser(targetUser.id);
                toast({ variant: 'destructive', title: 'User Blocked', description: `You have blocked ${targetUser.username}.` });
            }, isDestructive: true },
        ]
    });
  }

  const renderActionButton = (targetUser: PublicUser) => {
    const { status } = getConnectionStatus(targetUser);

    switch (status) {
      case 'friends':
        return <Badge variant="secondary">Friends</Badge>;
      case 'pending':
        return <Button variant="secondary" size="sm" disabled>Pending</Button>;
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      case 'not_connected':
        return <Button size="sm" onClick={async () => {
            await sendFriendRequest(targetUser.id);
            toast({ title: 'Friend Request Sent', description: `Your request has been sent to ${targetUser.username}`});
        }}><UserPlus className="mr-2 h-4 w-4" />Add Friend</Button>;
      case 'self':
        return <Badge>You</Badge>;
      default:
        return null;
    }
  };
  
  const pendingRequests = connections.filter(c => c.status === 'pending' && c.requestedBy !== user?.uid);
  const friends = connections.filter(c => c.status === 'friends');
  const blocked = connections.filter(c => c.status === 'blocked');

  const renderConnectionList = (list: (Connection & {user: PublicUser | undefined})[], emptyMessage: string) => {
    if (loading) {
      return Array.from({length: 3}).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
            </div>
        </div>
      ))
    }
    
    if (list.length === 0) {
      return <p className="text-muted-foreground text-center p-8">{emptyMessage}</p>;
    }
    
    return list.map(({ id, user: connectedUser, status, requestedBy }) => {
      if (!connectedUser) return null;
      return (
        <div key={id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50" data-command-hub-trigger>
          <div className="flex items-center gap-4">
            <UserQuickView user={connectedUser}>
              <Avatar 
                className="h-12 w-12 cursor-pointer"
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openHub(e, {
                    type: 'user',
                    data: {
                      viewProfile: () => router.push(`/profile/${connectedUser.id}`),
                      sendMessage: () => router.push(`/chat?contactId=${connectedUser.id}`),
                      voiceCall: () => console.log('Voice call', connectedUser.displayName),
                      videoCall: () => console.log('Video call', connectedUser.displayName),
                      addFriend: () => console.log('Add friend', connectedUser.displayName),
                      createGroup: () => console.log('Create group with', connectedUser.displayName),
                      muteUser: () => console.log('Mute', connectedUser.displayName),
                      pinChat: () => console.log('Pin chat', connectedUser.displayName),
                      blockUser: () => blockUser(connectedUser.id),
                      reportUser: () => console.log('Report', connectedUser.displayName),
                      isFriend: status === 'friends'
                    }
                  });
                }}
              >
                <AvatarImage src={connectedUser.photoURL || undefined} />
                <AvatarFallback>{connectedUser.displayName?.[0] || connectedUser.email?.[0]}</AvatarFallback>
              </Avatar>
            </UserQuickView>
            <div>
              <p className="font-semibold">{connectedUser.displayName || 'Unknown User'}</p>
              <p className="text-sm text-muted-foreground">@{connectedUser.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status === 'pending' && requestedBy !== user?.uid && (
              <>
                 <Button size="sm" variant="outline" onClick={() => acceptFriendRequest(id)}>Accept</Button>
                 <Button size="sm" variant="destructive" onClick={() => removeConnection(id)}>Decline</Button>
              </>
            )}
            {status === 'friends' && (
               <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeConnection(id)}><UserX className="h-4 w-4"/></Button></TooltipTrigger>
                    <TooltipContent><p>Unfriend</p></TooltipContent>
                  </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild><Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => blockUser(id)}><UserX className="h-4 w-4"/></Button></TooltipTrigger>
                    <TooltipContent><p>Block</p></TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            )}
             {status === 'blocked' && (
                <Button size="sm" variant="ghost" onClick={() => removeConnection(id)}>Unblock</Button>
            )}
          </div>
        </div>
      );
    });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users /> Connections</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <Tabs defaultValue="friends" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="blocked">Blocked ({blocked.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="friends" className="flex-1 overflow-y-auto">
              {renderConnectionList(friends.map(c => ({...c, user: users.find(u => u.id === c.id)})), "You haven't added any friends yet.")}
            </TabsContent>
            <TabsContent value="pending" className="flex-1 overflow-y-auto">
              {renderConnectionList(pendingRequests.map(c => ({...c, user: users.find(u => u.id === c.id)})), "No pending friend requests.")}
            </TabsContent>
            <TabsContent value="blocked" className="flex-1 overflow-y-auto">
               {renderConnectionList(blocked.map(c => ({...c, user: users.find(u => u.id === c.id)})), "No blocked users.")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search /> Find Operators</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              placeholder="Search by username..."
              value={usernameSearch}
              onChange={(e) => setUsernameSearch(e.target.value)}
              disabled={isSearching}
            />
            <Button type="submit" disabled={isSearching || !usernameSearch.trim()}>
              {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
            </Button>
          </form>
          <div className="flex-1 overflow-y-auto space-y-2">
            {isSearching && <p className="text-muted-foreground text-center p-4">Searching the matrix...</p>}
            {foundUser && (
              <div 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                onContextMenu={(e) => handleFoundUserClick(e, foundUser)}
                data-command-hub-trigger
              >
                <div className="flex items-center gap-3">
                  <UserQuickView user={foundUser}>
                    <Avatar>
                      <AvatarImage src={foundUser.photoURL || undefined} />
                      <AvatarFallback>{foundUser.displayName?.[0] || foundUser.email?.[0]}</AvatarFallback>
                    </Avatar>
                  </UserQuickView>
                  <div>
                    <p className="font-semibold">{foundUser.displayName || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">@{foundUser.username}</p>
                  </div>
                </div>
                {renderActionButton(foundUser)}
              </div>
            )}
            {!isSearching && !foundUser && (
                <p className="text-muted-foreground text-center p-4">Enter a username to find an operator.</p>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
