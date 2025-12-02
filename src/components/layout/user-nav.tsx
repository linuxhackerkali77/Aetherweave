'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditCard, LogOut, User as UserIcon, Box, Settings } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '../ui/skeleton';
import { useCommandHub } from '@/hooks/use-command-hub';
import StatusSelector from '../user/status-selector';

export default function UserNav() {
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { openHub } = useCommandHub();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline">Login</Button>
      </Link>
    );
  }
  
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full" 
          data-onboarding-id="profile-avatar"
          onContextMenu={(e) => {
            e.preventDefault();
            openHub(e, {
              type: 'user',
              data: {
                viewProfile: () => router.push('/settings'),
                sendMessage: () => router.push('/chat'),
                voiceCall: () => console.log('Voice call'),
                videoCall: () => console.log('Video call'),
                addFriend: () => console.log('Add friend'),
                createGroup: () => console.log('Create group'),
                muteUser: () => console.log('Mute user'),
                pinChat: () => console.log('Pin chat'),
                blockUser: () => console.log('Block user'),
                reportUser: () => console.log('Report user'),
                isFriend: false
              }
            });
          }}
        >
          <Avatar className="h-9 w-9 border-2 border-primary/50 animate-pulse-glow">
            <AvatarImage
              src={profile?.photoURL ?? user.photoURL ?? userAvatar?.imageUrl}
              alt={profile?.displayName ?? user.displayName ?? user.email ?? ''}
              data-ai-hint={userAvatar?.imageHint}
            />
            <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div>
              <p className="text-sm font-medium leading-none">{profile?.displayName ?? user.displayName ?? 'Operator'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
            <StatusSelector />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile & Settings</span>
            </DropdownMenuItem>
          </Link>
           <Link href="/inventory" data-onboarding-id="inventory-button">
            <DropdownMenuItem>
              <Box className="mr-2 h-4 w-4" />
              <span>My Inventory</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
