
'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { PhoneIncoming } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  type: 'user' | 'bot' | 'group';
}

interface SimulatedIncomingCallProps {
  onSimulate: (caller: Contact, type: 'video' | 'voice') => void;
  contacts: Contact[];
}

export default function SimulatedIncomingCall({ onSimulate, contacts }: SimulatedIncomingCallProps) {
  const userContacts = contacts.filter(c => c.type === 'user');

  if (userContacts.length === 0) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <PhoneIncoming className="mr-2 h-4 w-4" />
        Simulate Call (No contacts)
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          <PhoneIncoming className="mr-2 h-4 w-4" />
          Simulate Incoming Call
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {userContacts.map(contact => (
            <div key={contact.id}>
                 <DropdownMenuItem onClick={() => onSimulate(contact, 'voice')}>
                    Voice call from {contact.name}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSimulate(contact, 'video')}>
                    Video call from {contact.name}
                </DropdownMenuItem>
            </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
