
'use client';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockEvents = [
  {
    id: 1,
    title: 'Cyberware Maintenance',
    time: '14:00',
    color: 'bg-secondary',
  },
  {
    id: 2,
    title: 'Team Sync: Project Overdrive',
    time: '16:00',
    color: 'bg-primary',
  },
  {
    id: 3,
    title: 'Meet with Fixer "Whispers"',
    time: '19:30',
    color: 'bg-destructive',
  },
];

export default function CalendarWidget() {
  return (
    <ScrollArea className="h-48">
        <div className="space-y-4">
        {mockEvents.map((event) => (
            <div key={event.id} className="flex items-center gap-3">
            <div className={`w-1.5 h-10 rounded-full ${event.color}`}></div>
            <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {event.time}
                </p>
            </div>
            </div>
        ))}
        </div>
    </ScrollArea>
  );
}
