'use client';
import { useState, useEffect, useMemo } from 'react';
import { Search, Smile } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { emojiService, Emoji } from '@/services/emoji-service';
import { Skeleton } from '@/components/ui/skeleton';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGroup, setActiveGroup] = useState('');

  useEffect(() => {
    const loadEmojis = async () => {
      const fetchedEmojis = await emojiService.getEmojis();
      setEmojis(fetchedEmojis);
      setLoading(false);
    };
    loadEmojis();
  }, []);

  const groups = useMemo(() => emojiService.getEmojiGroups(), [emojis]);

  const filteredEmojis = useMemo(() => {
    if (searchTerm) {
      return emojiService.searchEmojis(searchTerm);
    }
    if (activeGroup) {
      return emojiService.getEmojisByGroup(activeGroup);
    }
    return emojis.slice(0, 100); // Show first 100 by default
  }, [emojis, searchTerm, activeGroup]);

  if (loading) {
    return (
      <div className="w-72 h-80 p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 32 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-7" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 h-80 flex flex-col overflow-hidden">
      <div className="p-2 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emojis..."
            className="pl-8 h-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeGroup} onValueChange={setActiveGroup} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-4 h-8 p-0.5 shrink-0">
          <TabsTrigger value="" className="text-xs h-7">All</TabsTrigger>
          {groups.slice(0, 3).map((group) => (
            <TabsTrigger key={group} value={group} className="text-xs h-7">
              {group.split('-')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeGroup} className="flex-1 mt-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-8 gap-1 p-2">
              {filteredEmojis.map((emoji) => (
                <button
                  key={emoji.slug}
                  className="h-7 w-7 flex items-center justify-center hover:bg-muted rounded text-sm transition-colors"
                  onClick={() => onEmojiSelect(emoji.character)}
                  title={emoji.unicodeName}
                >
                  {emoji.character}
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}