'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Shield, Eye, Settings, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const mockPermissions = {
    general: [
        { id: 'viewChannels', label: 'View Channels' },
        { id: 'manageChannels', label: 'Manage Channels' },
        { id: 'manageRoles', label: 'Manage Roles' },
        { id: 'manageSpace', label: 'Manage Space' },
        { id: 'createInvite', label: 'Create Invite' },
        { id: 'kickMembers', label: 'Kick Members' },
        { id: 'banMembers', label: 'Ban Members' },
        { id: 'timeoutMembers', label: 'Timeout Members' },
        { id: 'administrator', label: 'Administrator', description: 'Grants all permissions. A dangerous permission to grant.' },
    ],
    text: [
        { id: 'sendMessage', label: 'Send Messages' },
        { id: 'attachFiles', label: 'Attach Files' },
        { id: 'addReactions', label: 'Add Reactions' },
        { id: 'mentionEveryone', label: 'Mention @everyone' },
        { id: 'deleteMessages', label: 'Delete Messages' },
        { id: 'bypassSlowMode', label: 'Bypass Slow Mode' },
        { id: 'sendVoiceMessage', label: 'Send Voice Message' },
        { id: 'createPolls', label: 'Create Polls' },
    ],
    voice: [
        { id: 'connectToVC', label: 'Connect to Voice Channels' },
        { id: 'speakInVC', label: 'Speak in Voice Channels' },
        { id: 'shareScreen', label: 'Share Screen' },
        { id: 'shareCamera', label: 'Share Camera' },
        { id: 'muteMember', label: 'Mute Members' },
        { id: 'deafenMember', label: 'Deafen Members' },
    ],
}

const mockInitialRoles = [
  { id: '1', name: 'Admin', color: 'hsl(346.8 77.2% 49.8%)' },
  { id: '2', name: 'Moderator', color: 'hsl(217.2 91.2% 59.8%)' },
  { id: '3', name: 'Member', color: 'hsl(215 20.2% 65.1%)' },
];

export default function RoleSettings() {
  const [roles, setRoles] = useState(mockInitialRoles);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoles = roles.filter(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreateRole = () => {
    const newRole = { id: Date.now().toString(), name: 'new role', color: '#99AAB5' };
    setRoles([...roles, newRole]);
    setSelectedRole(newRole);
  };
  
  const updateSelectedRole = (field: string, value: any) => {
    const newRoles = roles.map(r => r.id === selectedRole.id ? {...r, [field]: value} : r);
    setRoles(newRoles);
    setSelectedRole(newRoles.find(r => r.id === selectedRole.id)!);
  }

  return (
    <div className="flex-1 flex min-h-0 gap-4">
      {/* Roles List */}
      <div className="w-56 flex flex-col gap-2">
         <div className="relative">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Search roles..." className="pl-8" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
         </div>
         <Button variant="outline" onClick={handleCreateRole}><Plus className="mr-2 h-4 w-4"/>Create Role</Button>
        <ScrollArea className="flex-1 pr-2 -mr-2">
          <div className="space-y-1">
            {filteredRoles.map(role => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={cn(
                  'flex items-center justify-between p-2 rounded-md cursor-pointer',
                  selectedRole.id === role.id ? 'bg-accent' : 'hover:bg-accent/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                  <span className="font-medium text-sm">{role.name}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Role Settings Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="text-xl font-bold font-headline text-glow">{selectedRole.name}</h3>
            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4"/></Button>
        </div>
        
        <Tabs defaultValue="display" className="flex-1 flex flex-col min-h-0 mt-2">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="display">Display</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="members">Manage Members</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1 mt-4 pr-3 -mr-3">
                <TabsContent value="display" className="mt-0 space-y-6">
                    <div className="space-y-2">
                        <Label>Role Name</Label>
                        <Input value={selectedRole.name} onChange={(e) => updateSelectedRole('name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Role Color</Label>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-md border" style={{backgroundColor: selectedRole.color}}/>
                            <Input type="color" value={selectedRole.color} onChange={(e) => updateSelectedRole('color', e.target.value)} className="w-24 p-1" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-background/30">
                        <Label htmlFor="display-separate" className="flex flex-col gap-1 cursor-pointer">
                            <span>Display role members separately</span>
                            <span className="font-normal text-muted-foreground text-sm">Show members with this role in their own group in the member list.</span>
                        </Label>
                        <Switch id="display-separate" />
                    </div>
                </TabsContent>
                <TabsContent value="permissions" className="mt-0 space-y-4">
                     <Accordion type="multiple" defaultValue={['general']} className="w-full">
                        {Object.entries(mockPermissions).map(([category, perms]) => (
                            <AccordionItem value={category} key={category}>
                                <AccordionTrigger className="capitalize text-lg font-headline">{category}</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                     {perms.map(perm => (
                                        <div key={perm.id} className="flex items-center justify-between p-4 rounded-lg border bg-background/30">
                                            <Label htmlFor={perm.id} className="flex flex-col gap-1 cursor-pointer">
                                                <span>{perm.label}</span>
                                                {perm.description && <span className="font-normal text-muted-foreground text-sm">{perm.description}</span>}
                                            </Label>
                                            <Switch id={perm.id} />
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </TabsContent>
                 <TabsContent value="members" className="mt-0 space-y-4">
                    <Button variant="outline"><Plus className="mr-2 h-4 w-4"/>Add Members</Button>
                     <p className="text-center text-muted-foreground">No members have this role yet.</p>
                </TabsContent>
            </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
