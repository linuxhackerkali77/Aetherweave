'use client';
import { ReactNode } from 'react';
import { PublicUser } from '@/hooks/use-connections';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Link as LinkIcon } from 'lucide-react';

interface UserQuickViewProps {
  user: PublicUser;
  children: ReactNode;
}

export default function UserQuickView({ user, children }: UserQuickViewProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback className="text-lg">
              {user.displayName?.[0] || user.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold">{user.displayName || 'Unknown User'}</h4>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.bio && (
              <p className="text-sm">{user.bio}</p>
            )}
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                Level {user.level || 1} • {user.xp || 0} XP
              </span>
            </div>
            {user.status && (
              <Badge variant="secondary" className="text-xs">
                {user.status}
              </Badge>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}