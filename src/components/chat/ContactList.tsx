
'use client';
import { useState, useMemo, memo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Bot, Pin, Plus, Users, MessageSquarePlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Contact, getDerivedStatus } from '@/app/chat/page';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { PublicUser } from '@/hooks/use-connections';
import { useCommandHub } from '@/hooks/use-command-hub';
import { useRouter } from 'next/navigation';
import { appEventEmitter } from '@/lib/event-emitter';
import ContactSelector from './ContactSelector';

interface ContactListProps {
    contacts: Contact[];
    pinnedContacts: Contact[];
    selectedContact: Contact | null;
    onSelectContact: (contact: Contact) => void;
    loading: boolean;
    isClient: boolean;
    onCreateGroup: () => void;
    connectedUsers: PublicUser[];
}

const ContactItem = memo(({ contact, selectedContact, onSelectContact, isClient, onContextMenu, openHub, router, connectedUsers }: {
    contact: Contact;
    selectedContact: Contact | null;
    onSelectContact: (contact: Contact) => void;
    isClient: boolean;
    onContextMenu: (e: React.MouseEvent, contact: Contact) => void;
    openHub: (event: React.MouseEvent, context: { type: string; actions?: any[]; data?: any }) => void;
    router: any;
    connectedUsers: PublicUser[];
}) => {
    if (!contact || !contact.name) {
      return null;
    }

    // Get real-time user data from connectedUsers
    const realTimeUser = contact.type === 'user' ? connectedUsers.find(u => u.id === contact.id) : null;
    const derivedStatus = isClient && realTimeUser ? getDerivedStatus(realTimeUser) : { label: contact.status || '...', color: 'bg-muted-foreground', isOnline: false };
    
    const initial = (contact.name ?? '?').charAt(0).toUpperCase();

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors",
                selectedContact?.id === contact.id ? 'bg-primary/20 neon-border-primary' : ''
            )}
            onClick={() => onSelectContact(contact)}
            onContextMenu={(e) => onContextMenu(e, contact)}
            data-command-hub-trigger
        >
            <div 
                className="relative"
                onContextMenu={(e) => {
                    if (contact.type === 'user') {
                        e.preventDefault();
                        e.stopPropagation();
                        openHub(e, {
                            type: 'user',
                            data: {
                                viewProfile: () => router.push(`/profile/${contact.id}`),
                                sendMessage: () => router.push(`/chat?contactId=${contact.id}`),
                                voiceCall: () => console.log('Voice call', contact.name),
                                videoCall: () => console.log('Video call', contact.name),
                                addFriend: () => console.log('Add friend', contact.name),
                                createGroup: () => console.log('Create group with', contact.name),
                                muteUser: () => console.log('Mute', contact.name),
                                pinChat: () => console.log('Pin chat', contact.name),
                                blockUser: () => console.log('Block', contact.name),
                                reportUser: () => console.log('Report', contact.name),
                                isFriend: true
                            }
                        });
                    }
                }}
            >
                <Avatar className="h-12 w-12 border-2 border-transparent">
                    {contact.type === 'bot' ?
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 rounded-full"><Bot className="w-6 h-6 text-primary" /></div> :
                        <AvatarImage src={realTimeUser?.photoURL || contact.avatar || undefined} />
                    }
                    <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
                {contact.type === 'user' && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn("absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background", derivedStatus.color)}></div>
                            </TooltipTrigger>
                            <TooltipContent><p>{derivedStatus.label}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-base">{realTimeUser?.displayName || contact.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                    {contact.type === 'bot' ? "AI Assistant" : derivedStatus.label}
                </p>
            </div>
        </div>
    )
});
ContactItem.displayName = 'ContactItem';

export default function ContactList({ contacts, pinnedContacts, selectedContact, onSelectContact, loading, isClient, onCreateGroup, connectedUsers }: ContactListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showContactSelector, setShowContactSelector] = useState(false);
    const { openHub, setTargetElement } = useCommandHub();
    const router = useRouter();

    const filteredContacts = useMemo(() => {
        if (!searchTerm) return contacts;
        return contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);
    
    const handleContactContextMenu = (e: React.MouseEvent, contact: Contact) => {
        e.preventDefault();
        e.stopPropagation();
        setTargetElement(e.currentTarget as HTMLElement);
        
        const isPinned = pinnedContacts.some(p => p.id === contact.id);

        let actions = [];
        if (contact.type === 'user') {
            actions.push(
                { label: 'View Profile', icon: 'User' as const, onClick: () => router.push(`/profile/${contact.id}`) },
                { label: 'Send Message', icon: 'MessageSquare' as const, onClick: () => router.push(`/chat?contactId=${contact.id}`) },
                { label: isPinned ? 'Unpin User' : 'Pin User', icon: 'Pin' as const, onClick: () => appEventEmitter.emit('ui:pin-user', contact) },
            );
        } else {
             actions.push(
                { label: 'View Bot Info', icon: 'Bot' as const, onClick: () => {} },
             );
        }

        openHub(e, {
            type: 'user-contact',
            data: contact,
            actions: actions,
        });
    };

    return (
        <Card className="hidden lg:flex lg:flex-col h-full">
            <CardHeader>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <button
                            onClick={onCreateGroup}
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Users className="w-4 h-4" />
                            New Group
                        </button>
                        <button
                            onClick={() => setShowContactSelector(true)}
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors text-sm font-medium"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            Contact List
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search connections..."
                            className="pl-8 bg-input"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                <ScrollArea className="h-full">
                    <div className="p-4 pt-0 space-y-1">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center space-x-4 p-2">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[150px]" />
                                        <Skeleton className="h-4 w-[100px]" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                {pinnedContacts.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1 flex items-center gap-2"><Pin className="w-3 h-3"/> Pinned</h3>
                                        {pinnedContacts.filter(Boolean).map(contact => (
                                             <ContactItem key={`pinned-${contact.id}`} contact={contact} selectedContact={selectedContact} onSelectContact={onSelectContact} isClient={isClient} onContextMenu={handleContactContextMenu} openHub={openHub} router={router} connectedUsers={connectedUsers} />
                                        ))}
                                    </div>
                                )}
                                {filteredContacts.filter(c => c && c.id).map((contact) => (
                                   <ContactItem key={contact.id} contact={contact} selectedContact={selectedContact} onSelectContact={onSelectContact} isClient={isClient} onContextMenu={handleContactContextMenu} openHub={openHub} router={router} connectedUsers={connectedUsers} />
                                ))}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <ContactSelector
                open={showContactSelector}
                onOpenChange={setShowContactSelector}
                contacts={contacts}
                onSelectContact={onSelectContact}
            />
        </Card>
    );
}
