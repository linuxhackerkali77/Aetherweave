'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PublicUser } from '@/hooks/use-connections';
import { Users, X } from 'lucide-react';

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friends: PublicUser[];
  onCreateGroup: (name: string, selectedMembers: PublicUser[]) => void;
  loading?: boolean;
}

export default function CreateGroupModal({ open, onOpenChange, friends, onCreateGroup, loading }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<PublicUser[]>([]);

  const handleMemberToggle = (friend: PublicUser) => {
    setSelectedMembers(prev => 
      prev.find(m => m.id === friend.id)
        ? prev.filter(m => m.id !== friend.id)
        : [...prev, friend]
    );
  };

  const handleCreate = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      onCreateGroup(groupName.trim(), selectedMembers);
      setGroupName('');
      setSelectedMembers([]);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedMembers([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Group Chat
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Select Members ({selectedMembers.length} selected)</Label>
            <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={selectedMembers.some(m => m.id === friend.id)}
                    onCheckedChange={() => handleMemberToggle(friend)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.photoURL || undefined} />
                    <AvatarFallback>{friend.displayName?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm">{friend.displayName || 'Unknown'}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedMembers.length > 0 && (
            <div>
              <Label>Selected Members</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                    <span>{member.displayName}</span>
                    <button onClick={() => handleMemberToggle(member)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!groupName.trim() || selectedMembers.length === 0 || loading}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}