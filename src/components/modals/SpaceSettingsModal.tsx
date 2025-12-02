'use client';
import { useState, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UploadCloud, ImageUp, Trash2, Save, Loader2, Info, Users, MoreHorizontal, User, MessageSquare, ShieldBan, LogOut, Clock, Gavel, Sparkles, Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AetherLogo from '../aether-logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/hooks/use-user';
import { useConnections } from '@/hooks/use-connections';
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '../ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import RoleSettings from '../settings/RoleSettings';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface SpaceSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  space: { id: string; name: string; icon?: any };
}

const mockRoles = [
    { id: 'admin', name: 'Admin', color: 'bg-red-500' },
    { id: 'moderator', name: 'Moderator', color: 'bg-blue-500' },
    { id: 'member', name: 'Member', color: 'bg-gray-500' },
];

const mockInvites = [
    { id: 'invite-1', user: { name: 'Jaina Proudmoore', avatar: '' }, invitedBy: 'mubah3r', status: 'Joined', date: new Date(Date.now() - 86400000 * 1) },
    { id: 'invite-2', user: { name: 'Kael\'thas Sunstrider', avatar: '' }, invitedBy: 'link', status: 'Joined', date: new Date(Date.now() - 86400000 * 3) },
    { id: 'invite-3', user: { name: 'Sylvanas Windrunner', avatar: '' }, invitedBy: 'mubah3r', status: 'Pending', date: new Date() },
];

const mockBans = [
    { id: 'ban-1', user: { id: 'user-b1', name: 'Arthas Menethil', username: 'LichKing', avatar: '' }, reason: 'Spamming', bannedBy: 'mubah3r' },
]


export default function SpaceSettingsModal({
  isOpen,
  onOpenChange,
  space,
}: SpaceSettingsModalProps) {
  const { profile: currentUser } = useUser();
  const { users: allUsers } = useConnections();
  const [spaceName, setSpaceName] = useState(space.name);
  const [spaceIcon, setSpaceIcon] = useState<string | null>(null);
  const [spaceDescription, setSpaceDescription] = useState('The official hub for Aetherweave platform updates, community events, and support.');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const iconInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const members = useMemo(() => {
    // In a real app, this would be fetched based on space members
    // For now, we use all connected users as mock members
    return allUsers.map(u => ({
        ...u,
        spaceJoinDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30), // Random join date in the last 30 days
        roles: [mockRoles[Math.floor(Math.random() * mockRoles.length)]]
    }));
  }, [allUsers]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setSpaceIcon(e.target?.result as string);
        reader.readAsDataURL(file);
    }
  }
  
  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
        setIsSaving(false);
        toast({ title: 'Space settings updated!'});
        onOpenChange(false);
    }, 1500)
  }
  
  const handleDeleteSpace = () => {
    toast({ variant: 'destructive', title: `Space "${spaceName}" has been deleted.` });
    onOpenChange(false);
  }

  const handleAdminAction = (action: string, userName: string) => {
    toast({
        title: `Action: ${action}`,
        description: `Performed '${action}' on user ${userName}.`
    });
  }

  const handleRoleChange = (userName: string, roleName: string) => {
    toast({
        title: `Role Updated`,
        description: `${userName} has been assigned the ${roleName} role.`
    });
  }
  
  const handleUnban = (userName: string) => {
    toast({
        title: 'User Unbanned',
        description: `${userName} is no longer banned from this space.`
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
             <Sparkles className="text-primary"/>
             Space Settings: {space.name}
          </DialogTitle>
          <DialogDescription>
            Manage your Space's identity, roles, members, and integrations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex min-h-0">
          <Tabs defaultValue="overview" className="flex-1 flex min-h-0">
              <div className="w-56 pr-4 border-r border-border">
                <TabsList className="grid grid-cols-1 h-auto bg-transparent p-0">
                  <TabsTrigger value="overview" className="justify-start px-2 py-1.5">Overview</TabsTrigger>
                  <TabsTrigger value="roles" className="justify-start px-2 py-1.5">Roles</TabsTrigger>
                  <TabsTrigger value="members" className="justify-start px-2 py-1.5">Members</TabsTrigger>
                  <TabsTrigger value="invites" className="justify-start px-2 py-1.5">Invites</TabsTrigger>
                  <TabsTrigger value="bans" className="justify-start px-2 py-1.5">Bans</TabsTrigger>
                  <div className="my-2 border-t border-destructive/30"></div>
                  <TabsTrigger value="deletion" className="justify-start px-2 py-1.5 text-destructive focus:text-destructive">Delete Space</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 pl-6 min-w-0">
                <TabsContent value="overview" className="flex-1 flex flex-col min-h-0 py-4 space-y-6 mt-0">
                  <h4 className="font-bold text-primary text-glow">Space Profile</h4>
                  <div className="flex items-center gap-4">
                      <div className="relative group">
                          <Avatar className="w-24 h-24 border-4 border-dashed border-primary/50">
                              {spaceIcon ? (
                                  <AvatarImage src={spaceIcon} className="object-cover" />
                              ): (
                                  <AvatarFallback className="bg-transparent text-primary">
                                      <AetherLogo className="w-12 h-12"/>
                                  </AvatarFallback>
                              )}
                          </Avatar>
                          <div className="absolute inset-0 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <input type="file" accept="image/*" ref={iconInputRef} onChange={handleIconChange} className="hidden" />
                              <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => iconInputRef.current?.click()}>
                                  <ImageUp className="w-5 h-5"/>
                              </Button>
                              <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setSpaceIcon(null)}>
                                  <Trash2 className="w-5 h-5"/>
                              </Button>
                          </div>
                      </div>
                      <div className="flex-1 space-y-2">
                          <Label htmlFor="space-name">Space Name</Label>
                          <Input id="space-name" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="space-description">Description</Label>
                      <Textarea id="space-description" value={spaceDescription} onChange={(e) => setSpaceDescription(e.target.value)} placeholder="Let everyone know what your space is about."/>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3"/>This will be visible in the Space discovery directory.</p>
                  </div>
                  <DialogFooter className="mt-auto !justify-start">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </TabsContent>
                <TabsContent value="roles" className="flex-1 flex flex-col min-h-0 mt-0">
                  <RoleSettings />
                </TabsContent>
                <TabsContent value="members" className="flex-1 flex flex-col min-h-0 mt-0">
                  <ScrollArea className="flex-1 -mx-6 px-6">
                      <div className="py-4 space-y-2">
                          {members.map(member => (
                              <div key={member.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                  <div className="flex items-center gap-4">
                                      <Avatar className="h-10 w-10">
                                          <AvatarImage src={member.photoURL || undefined} />
                                          <AvatarFallback>{member.displayName?.[0]}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                          <p className="font-semibold">{member.displayName}</p>
                                          <p className="text-xs text-muted-foreground">@{member.username}</p>
                                      </div>
                                  </div>
                                  <div className="hidden md:flex flex-col text-xs text-muted-foreground">
                                      <p>Space Join: {format(member.spaceJoinDate, 'MMM d, yyyy')}</p>
                                      <p>Aetherweave Join: {format(member.createdAt.toDate(), 'MMM d, yyyy')}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      {member.roles.map(role => (
                                          <Badge key={role.id} variant="secondary">{role.name}</Badge>
                                      ))}
                                  </div>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                              <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                          <DropdownMenuItem onClick={() => router.push(`/profile/${member.id}`)}><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => router.push(`/chat?contactId=${member.id}`)}><MessageSquare className="mr-2 h-4 w-4" /> Message</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleAdminAction('Block', member.displayName!)}><ShieldBan className="mr-2 h-4 w-4" /> Block</DropdownMenuItem>
                                          <DropdownMenuSub>
                                              <DropdownMenuSubTrigger>
                                                  <span className="font-semibold">Roles</span>
                                              </DropdownMenuSubTrigger>
                                              <DropdownMenuPortal>
                                                  <DropdownMenuSubContent>
                                                      {mockRoles.map(role => (
                                                          <DropdownMenuItem key={role.id} onClick={() => handleRoleChange(member.displayName!, role.name)}>
                                                              {role.name}
                                                          </DropdownMenuItem>
                                                      ))}
                                                  </DropdownMenuSubContent>
                                              </DropdownMenuPortal>
                                          </DropdownMenuSub>
                                          <DropdownMenuItem className="text-destructive" onClick={() => handleAdminAction('Timeout', member.displayName!)}><Clock className="mr-2 h-4 w-4"/> Timeout</DropdownMenuItem>
                                          <DropdownMenuItem className="text-destructive" onClick={() => handleAdminAction('Kick', member.displayName!)}><LogOut className="mr-2 h-4 w-4"/> Kick</DropdownMenuItem>
                                          <DropdownMenuItem className="text-destructive" onClick={() => handleAdminAction('Ban', member.displayName!)}><Gavel className="mr-2 h-4 w-4"/> Ban</DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </div>
                          ))}
                      </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="invites" className="flex-1 flex flex-col min-h-0 mt-0">
                  <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="py-4 space-y-2">
                        {mockInvites.map(invite => (
                             <div key={invite.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                <div className="flex items-center gap-4">
                                     <Avatar className="h-10 w-10">
                                          <AvatarImage src={invite.user.avatar} />
                                          <AvatarFallback>{invite.user.name?.[0]}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-semibold">{invite.user.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {invite.invitedBy === 'link' ? 'Joined via link' : `Invited by @${invite.invitedBy}`}
                                        </p>
                                      </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {format(invite.date, 'MMM d, yyyy')}
                                </div>
                                <Badge variant={invite.status === 'Joined' ? 'secondary' : 'default'}>{invite.status}</Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({title: 'Invite Revoked'})}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                             </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="bans" className="flex-1 flex flex-col min-h-0 mt-0">
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="py-4 space-y-2">
                             {mockBans.map(ban => (
                             <div key={ban.id} className="flex items-center justify-between p-2 rounded-md bg-destructive/10">
                                <div className="flex items-center gap-4">
                                     <Avatar className="h-10 w-10">
                                          <AvatarImage src={ban.user.avatar} />
                                          <AvatarFallback>{ban.user.name?.[0]}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-semibold">{ban.user.name}</p>
                                        <p className="text-xs text-muted-foreground">Banned by @{ban.bannedBy}</p>
                                      </div>
                                </div>
                                <p className="text-sm text-muted-foreground">Reason: {ban.reason}</p>
                                <Button variant="outline" size="sm" onClick={() => handleUnban(ban.user.name)}>Unban</Button>
                             </div>
                        ))}
                        {mockBans.length === 0 && <p className="text-center text-muted-foreground py-8">No banned users.</p>}
                        </div>
                    </ScrollArea>
                </TabsContent>
                 <TabsContent value="deletion" className="flex-1 flex flex-col min-h-0 mt-0">
                    <Alert variant="destructive" className="mt-4">
                      <ShieldBan className="h-4 w-4" />
                      <AlertTitle>Delete Space</AlertTitle>
                      <AlertDescription>
                        This is a permanent action and cannot be undone. All data associated with this space will be permanently erased.
                      </AlertDescription>
                    </Alert>
                    <div className="mt-6 space-y-2">
                        <Label htmlFor="delete-confirm">To confirm, type "<span className="font-bold text-primary">{spaceName}</span>" below:</Label>
                        <Input 
                            id="delete-confirm" 
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                        />
                    </div>
                    <Button 
                        variant="destructive" 
                        className="w-full mt-4"
                        disabled={deleteConfirmation !== spaceName}
                        onClick={handleDeleteSpace}
                    >
                        Delete This Space
                    </Button>
                 </TabsContent>
              </div>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
