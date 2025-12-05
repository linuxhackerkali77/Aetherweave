
import { EventEmitter } from 'events';

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Cyber Rare' | 'Legendary' | 'Mythic';

export const appEventEmitter = new EventEmitter();
