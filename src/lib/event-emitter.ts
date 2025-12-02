
import { EventEmitter } from 'events';
import { PublicUser } from '@/hooks/use-connections';
import { Message } from '@/app/chat/page';

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Cyber Rare' | 'Legendary' | 'Mythic';

type AppEvents = {
  'xp:earned': () => void;
  'ui:click': (e: MouseEvent) => void;
  'ui:contextmenu': (e: MouseEvent) => void;
  'cursor:rarity-hover:start': (rarity: Rarity) => void;
  'cursor:rarity-hover:end': () => void;
  'ui:sound': (sound: 'hub-open' | 'hub-close' | 'click' | 'success' | 'error') => void;
  'ui:pin-user': (user: PublicUser) => void;
  'ui:show-user-profile': (userId: string) => void;
  'chat:reply-to': (message: Message) => void;
};

// Typed EventEmitter
declare interface TypedEventEmitter<TEvents extends Record<string, any>> {
  on<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: TEvents[TEvent]
  ): this;
  off<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: TEvents[TEvent]
  ): this;
  emit<TEvent extends keyof TEvents>(
    event: TEvent,
    ...args: Parameters<TEvents[TEvent]>
  ): boolean;
}

class TypedEventEmitter<
  TEvents extends Record<string, any>
> extends EventEmitter {}

export const appEventEmitter = new TypedEventEmitter<AppEvents>();
