
'use client';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Contact } from '@/types/chat';
import { getDerivedStatus } from '@/lib/chat-utils';
import { PublicUser } from '@/hooks/use-connections';
import { User, File, Bell } from 'lucide-react';
import Link from 'next/link';
import UserPopover from '../user/user-popover';

interface ContactDetailsProps {
    contact: Contact | null;
    connectedUsers: PublicUser[];
    isClient: boolean;
}

export default function ContactDetails({ contact, connectedUsers, isClient }: ContactDetailsProps) {
    if (!contact || contact.type === 'bot') return null;
    
    if (!contact) {
        return (
            <Card className="hidden lg:flex lg:flex-col">
                 <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                 <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                 </CardContent>
            </Card>
        )
    }
    
    const userProfile = contact.type === 'user' ? connectedUsers.find(u => u.id === contact.id) : null;
    const derivedStatus = isClient && userProfile ? getDerivedStatus(userProfile) : { label: '...', color: 'bg-muted-foreground', isOnline: false };

    return (
        <Card className="hidden lg:flex lg:flex-col h-full">
            <CardHeader className="text-center">
                 <UserPopover user={userProfile!}>
                    <Avatar className="h-24 w-24 mx-auto border-4 border-primary cursor-pointer">
                        <AvatarImage src={contact.avatar || undefined} />
                        <AvatarFallback className="text-3xl">{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                 </UserPopover>
                <UserPopover user={userProfile!}>
                    <CardTitle className="mt-4 cursor-pointer hover:underline">{contact.name}</CardTitle>
                </UserPopover>
                {userProfile && <p className="text-muted-foreground">@{userProfile.username}</p>}
                {contact.type === 'user' && <p className="text-sm font-semibold">{derivedStatus.label}</p>}
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <Button variant="outline" className="w-full" asChild>
                    <Link href={`/profile/${contact.id}`}>
                        <User className="mr-2 h-4 w-4"/> View Profile
                    </Link>
                </Button>
                <Button variant="outline" className="w-full">
                    <Bell className="mr-2 h-4 w-4"/> Mute Notifications
                </Button>

                <div className="space-y-2 pt-4">
                    <h4 className="font-semibold">Shared Files</h4>
                    <div className="text-center text-muted-foreground p-4 border-2 border-dashed border-border rounded-lg">
                        <File className="w-8 h-8 mx-auto mb-2"/>
                        <p>No files shared yet.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

    