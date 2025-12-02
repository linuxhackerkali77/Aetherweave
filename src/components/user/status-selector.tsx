'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Circle, ChevronDown } from 'lucide-react';
import { usePresence } from '@/hooks/use-presence';
import { cn } from '@/lib/utils';

const statusOptions = [
  { value: 'online', label: 'Online', color: 'bg-green-500' },
  { value: 'away', label: 'Away', color: 'bg-yellow-500' },
  { value: 'busy', label: 'Busy', color: 'bg-red-500' },
  { value: 'offline', label: 'Invisible', color: 'bg-gray-500' },
];

export default function StatusSelector() {
  const { status: presenceStatus, updatePresence } = usePresence();
  const [customStatus, setCustomStatus] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const currentStatus = statusOptions.find(s => s.value === presenceStatus) || statusOptions[0];

  const handleStatusChange = async (status: string) => {
    await updatePresence(status as any);
    setShowCustomInput(false);
  };

  const handleCustomStatus = async () => {
    if (customStatus.trim()) {
      await updatePresence(customStatus.trim() as any);
      setCustomStatus('');
      setShowCustomInput(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 px-2 gap-2">
          <Circle className={cn("w-3 h-3", currentStatus.color)} />
          <span className="text-sm">{currentStatus.label}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            className="flex items-center gap-2"
          >
            <Circle className={cn("w-3 h-3", status.color)} />
            {status.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {showCustomInput ? (
          <div className="p-2 space-y-2">
            <Input
              placeholder="Set custom status..."
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomStatus()}
              className="h-8"
              autoFocus
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleCustomStatus} className="h-6 text-xs">
                Set
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCustomInput(false)} className="h-6 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem onClick={() => setShowCustomInput(true)}>
            Set custom status...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}