
'use client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CardHeader } from '@/components/ui/card';
import { MoreVertical, Bot, Settings, Users, UserPlus } from 'lucide-react';
import CallActionButtons from '@/components/calls/CallActionButtons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Contact, getDerivedStatus } from '@/app/chat/page';
import { PublicUser } from '@/hooks/use-connections';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import UserPopover from '../user/user-popover';


interface ChatHeaderProps {
    contact: Contact | null;
    onStartCall?: (type: 'video' | 'voice') => void;
    connectedUsers: PublicUser[];
    isClient: boolean;
    onGroupSettings?: () => void;
    onAddToGroup?: () => void;
    onViewMembers?: () => void;
}

export default function ChatHeader({ contact, onStartCall, connectedUsers, isClient, onGroupSettings, onAddToGroup, onViewMembers }: ChatHeaderProps) {
    if (!contact) {
        return (
            <CardHeader className="flex-row items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            </CardHeader>
        );
    }
    
    // Get real-time user data from connectedUsers instead of static contact data
    const realTimeUser = contact.type === 'user' ? connectedUsers.find(u => u.id === contact.id) : null;
    const derivedStatus = isClient && realTimeUser ? getDerivedStatus(realTimeUser) : { label: contact.status || '...', color: 'bg-muted-foreground', isOnline: false };
    const canCall = contact.type === 'user' && derivedStatus.isOnline;

    return (
        <CardHeader className="flex-row items-center justify-between border-b p-3 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                 <div className="relative flex-shrink-0">
                    {contact.type === 'group' ? (
                        <Avatar className="h-8 w-8 md:h-12 md:w-12 border-2 border-transparent">
                            <div className="w-full h-full flex items-center justify-center bg-secondary/20 rounded-full">
                                <Users className="w-6 h-6 text-secondary" />
                            </div>
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <UserPopover user={realTimeUser || contact as PublicUser}>
                            <Avatar className="h-8 w-8 md:h-12 md:w-12 border-2 border-transparent cursor-pointer">
                                {contact.type === 'bot' ?
                                    <div className="w-full h-full flex items-center justify-center bg-primary/20 rounded-full"><Bot className="w-6 h-6 text-primary" /></div> :
                                    <AvatarImage src={realTimeUser?.photoURL || contact.avatar || undefined} />
                                }
                                <AvatarFallback>{(realTimeUser?.displayName || contact.name).charAt(0)}</AvatarFallback>
                            </Avatar>
                        </UserPopover>
                    )}
                    {contact.type === 'user' && (
                        <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full border-2 border-background", derivedStatus.color)}></div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    {contact.type === 'group' ? (
                        <>
                            <h2 className="text-sm md:text-xl font-headline text-glow truncate">{contact.name}</h2>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">{contact.status}</p>
                        </>
                    ) : (
                        <>
                            <UserPopover user={realTimeUser || contact as PublicUser}>
                                <h2 className="text-sm md:text-xl font-headline text-glow cursor-pointer hover:underline truncate">{realTimeUser?.displayName || contact.name}</h2>
                            </UserPopover>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">{contact.type === 'bot' ? 'AI Assistant' : derivedStatus.label}</p>
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                {contact.type === 'user' && contact.id !== 'aether-bot' && (
                    <CallActionButtons
                        userId={contact.id}
                        userName={contact.name}
                        userAvatar={contact.avatar}
                        disabled={!canCall}
                    />
                )}
                {contact.type !== 'bot' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 md:h-10 md:w-10">
                                <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {contact.type === 'group' ? (
                                <>
                                    <DropdownMenuItem onClick={onViewMembers}>
                                        <Users className="w-4 h-4 mr-2" />
                                        View Members
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onAddToGroup}>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add Members
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={onGroupSettings}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Group Settings
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add to Group
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Chat Settings
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </CardHeader>
    );
}
