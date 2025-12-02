
import { MessageSquare, StickyNote, Award, Star, Shield, Users, FileUp, type LucideIcon } from 'lucide-react';

export type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythical";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  icon: LucideIcon;
  level: number;
}


export const achievements: Achievement[] = [
    {
        id: 'pioneer',
        name: 'Pioneer',
        description: 'Joined the Aetherweave platform during its initial phase. A true trailblazer.',
        rarity: 'Epic',
        icon: Star,
        level: 1,
    },
    {
        id: 'archivist-1',
        name: 'Archivist I',
        description: 'Created your first note in the NoteForge.',
        rarity: 'Common',
        icon: StickyNote,
        level: 2,
    },
     {
        id: 'archivist-2',
        name: 'Archivist II',
        description: 'Created 25 notes.',
        rarity: 'Rare',
        icon: StickyNote,
        level: 10,
    },
    {
        id: 'communicator-1',
        name: 'Communicator I',
        description: 'Sent your first message in Aether Chat.',
        rarity: 'Common',
        icon: MessageSquare,
        level: 1,
    },
    {
        id: 'communicator-2',
        name: 'Communicator II',
        description: 'Sent 100 messages.',
        rarity: 'Rare',
        icon: MessageSquare,
        level: 5,
    },
    {
        id: 'communicator-3',
        name: 'Communicator III',
        description: 'Sent 1000 messages.',
        rarity: 'Epic',
        icon: MessageSquare,
        level: 15,
    },
    {
        id: 'socialite-1',
        name: 'Socialite I',
        description: 'Made your first connection.',
        rarity: 'Common',
        icon: Users,
        level: 4,
    },
    {
        id: 'socialite-2',
        name: 'Socialite II',
        description: 'Made 5 connections.',
        rarity: 'Rare',
        icon: Users,
        level: 15,
    },
    {
        id: 'cloud-warrior-1',
        name: 'Cloud Warrior',
        description: 'Uploaded your first file to CloudDrive.',
        rarity: 'Common',
        icon: FileUp,
        level: 5,
    },
    {
        id: 'guardian',
        name: 'Guardian',
        description: 'Achieved a trust level of 75.',
        rarity: 'Epic',
        icon: Shield,
        level: 25,
    },
    {
        id: 'overlord',
        name: 'Overlord',
        description: 'Reached Level 50.',
        rarity: 'Legendary',
        icon: Award,
        level: 50,
    },
];

