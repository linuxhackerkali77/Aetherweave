'use client';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Bot } from 'lucide-react';
import { Contact } from '@/types/chat';
import { getDerivedStatus } from '@/lib/chat-utils';
import { PublicUser } from '@/hooks/use-connections';
import { cn } from '@/lib/utils';

interface ContactSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

export default function ContactSelector({ open, onOpenChange, contacts, onSelectContact }: ContactSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts;
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  const handleSelectContact = (contact: Contact) => {
    onSelectContact(contact);
    onOpenChange(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-80">
            <div className="space-y-1">
              {filteredContacts.map((contact) => {
                const derivedStatus = getDerivedStatus(contact as unknown as PublicUser);
                const initial = contact.name.charAt(0).toUpperCase();
                
                return (
                  <div
                    key={contact.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    )}
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        {contact.type === 'bot' ? (
                          <div className="w-full h-full flex items-center justify-center bg-primary/20 rounded-full">
                            <Bot className="w-5 h-5 text-primary" />
                          </div>
                        ) : (
                          <AvatarImage src={contact.avatar || undefined} />
                        )}
                        <AvatarFallback>{initial}</AvatarFallback>
                      </Avatar>
                      {contact.type === 'user' && (
                        <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background", derivedStatus.color)}></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contact.type === 'bot' ? "AI Assistant" : derivedStatus.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}