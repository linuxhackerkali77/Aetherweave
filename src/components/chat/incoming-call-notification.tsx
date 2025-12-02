
'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PublicUser } from '@/hooks/use-connections';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface IncomingCallNotificationProps {
  caller: PublicUser | undefined;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallNotification({
  caller,
  onAccept,
  onReject,
}: IncomingCallNotificationProps) {

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="p-8 rounded-2xl w-full max-w-sm animate-in fade-in-50 zoom-in-95 glass-card text-center">
        <p className="text-muted-foreground font-semibold">Incoming Call</p>
        <Avatar className="w-24 h-24 mx-auto my-4 border-4 border-primary neon-glow-primary">
          <AvatarImage src={caller?.photoURL || undefined} />
          <AvatarFallback className="text-3xl">{caller?.displayName?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-headline text-glow">{caller?.displayName || 'Unknown Caller'}</h2>
        <p className="text-muted-foreground">is calling you...</p>
        <div className="mt-8 flex justify-around">
          <div className="flex flex-col items-center gap-2">
            <Button size="icon" className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/80" onClick={onReject}>
              <PhoneOff />
            </Button>
            <span className="text-sm">Reject</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button size="icon" className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600" onClick={onAccept}>
              <Phone />
            </Button>
            <span className="text-sm">Accept</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
