'use client';

import { Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCall } from '@/contexts/CallContext';

interface CallActionButtonsProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  disabled?: boolean;
}

export default function CallActionButtons({ userId, userName, userAvatar, disabled }: CallActionButtonsProps) {
  const { startCall } = useCall();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 md:h-10 md:w-10"
        onClick={() => startCall(userId, userName, 'voice', userAvatar)}
        disabled={disabled}
        title="Voice Call"
      >
        <Phone className="w-4 h-4 md:w-5 md:h-5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 md:h-10 md:w-10"
        onClick={() => startCall(userId, userName, 'video', userAvatar)}
        disabled={disabled}
        title="Video Call"
      >
        <Video className="w-4 h-4 md:w-5 md:h-5" />
      </Button>
    </>
  );
}
