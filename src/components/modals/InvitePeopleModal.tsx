
'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useConnections } from '@/hooks/use-connections';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, UserPlus, Link as LinkIcon, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvitePeopleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  space: { name: string };
}

export default function InvitePeopleModal({
  isOpen,
  onOpenChange,
  space,
}: InvitePeopleModalProps) {
  const { connections, users, loading } = useConnections();
  const [searchTerm, setSearchTerm] = useState('');
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const friends = useMemo(() => {
    return connections
      .filter(c => c.status === 'friends')
      .map(c => users.find(u => u.id === c.id))
      .filter(Boolean);
  }, [connections, users]);

  const filteredFriends = useMemo(() => {
    if (!searchTerm) return friends;
    return friends.filter(friend =>
      friend?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friends, searchTerm]);

  const handleInvite = (userId: string) => {
    setInvited(prev => new Set(prev).add(userId));
    toast({
      title: 'Invitation Sent',
      description: `Your invite has been sent.`,
    });
  };

  const handleGenerateLink = () => {
    const inviteLink = `${window.location.origin}/join/${space.name.toLowerCase().replace(/\s/g, '-')}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Link Copied!',
      description: 'Your invitation link is ready to be shared.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle>Invite Operators to {space.name}</DialogTitle>
          <DialogDescription>
            Search for friends or generate a shareable link.
          </DialogDescription>
        </DialogHeader>
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-64 border rounded-md">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground p-4">No friends found.</p>
            ) : (
              filteredFriends.map((friend) => {
                if (!friend) return null;
                const isInvited = invited.has(friend.id);
                return (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.photoURL || undefined} />
                        <AvatarFallback>{friend.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{friend.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{friend.username}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleInvite(friend.id)}
                      disabled={isInvited}
                      variant={isInvited ? 'secondary' : 'default'}
                    >
                      {isInvited ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Invited
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" /> Invite
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        <div className="mt-4 border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">Or share an invite link:</p>
          <Button className="w-full" variant="outline" onClick={handleGenerateLink}>
            <LinkIcon className="mr-2 h-4 w-4" /> Generate & Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
