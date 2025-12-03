'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Contact } from '@/app/chat/page';
import { PublicUser } from '@/hooks/use-connections';
import { Users, Upload, X, UserMinus, Crown, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GroupSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Contact | null;
  onUpdateGroup: (groupId: string, updates: { name?: string; avatar?: string }) => void;
  onRemoveMember: (groupId: string, memberId: string) => void;
  onLeaveGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  currentUserId: string;
  loading?: boolean;
}

export default function GroupSettingsModal({ 
  open, 
  onOpenChange, 
  group, 
  onUpdateGroup, 
  onRemoveMember,
  onLeaveGroup,
  onDeleteGroup,
  currentUserId,
  loading 
}: GroupSettingsModalProps) {
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');

  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setGroupAvatar(group.avatar || '');
    }
  }, [group]);

  const handleSave = () => {
    if (group && groupName.trim()) {
      onUpdateGroup(group.id, {
        name: groupName.trim(),
        avatar: groupAvatar
      });
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (group) {
      onRemoveMember(group.id, memberId);
    }
  };

  const handleLeaveGroup = () => {
    if (group) {
      onLeaveGroup(group.id);
      onOpenChange(false);
    }
  };

  const handleDeleteGroup = () => {
    if (group && window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      onDeleteGroup(group.id);
      onOpenChange(false);
    }
  };

  if (!group) return null;

  const isAdmin = true; // TODO: Check if current user is admin
  const members = group.members || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Group Info</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={groupAvatar} />
                  <AvatarFallback className="text-2xl">
                    {groupName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // TODO: Upload file and set avatar URL
                          console.log('Upload avatar:', file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="w-full space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={!isAdmin}
                  placeholder="Enter group name..."
                />
              </div>
              
              <div className="w-full">
                <Label>Group ID</Label>
                <Input value={group.id} disabled className="text-muted-foreground" />
              </div>
              
              {isAdmin && (
                <Button onClick={handleSave} disabled={loading || !groupName.trim()}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Members ({members.length})</Label>
              {isAdmin && (
                <Button size="sm" variant="outline">
                  Add Members
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.photoURL || undefined} />
                        <AvatarFallback>
                          {member.displayName?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.displayName || 'Unknown'}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {member.id === currentUserId && <Crown className="w-3 h-3" />}
                          {member.id === currentUserId ? 'You' : 'Member'}
                        </div>
                      </div>
                    </div>
                    
                    {isAdmin && member.id !== currentUserId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleLeaveGroup}
                className="w-full justify-start text-orange-600 hover:text-orange-700"
              >
                <X className="w-4 h-4 mr-2" />
                Leave Group
              </Button>
              
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={handleDeleteGroup}
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  Delete Group
                </Button>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Leaving the group will remove you from all conversations</p>
              {isAdmin && <p>• Deleting the group will permanently remove it for all members</p>}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}