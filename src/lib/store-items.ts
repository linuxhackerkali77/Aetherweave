
import { Palette, Award, Sparkles, Shield, ImageIcon, Music, Puzzle, Box, Package, LucideIcon, ShoppingBag, AppWindow, WifiOff } from "lucide-react";

export interface StoreCategory {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
}

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Cyber Rare' | 'Legendary' | 'Mythic';

export interface StoreItem {
    id: string;
    category: string;
    name:string;
    description: string;
    price: number;
    rarity: Rarity;
    imageUrl?: string;
    icon: LucideIcon;
    unlocksBadge?: string;
}

export const storeCategories: StoreCategory[] = [
    {
        id: "themes",
        name: "Themes & UI Skins",
        description: "Customize the entire look and feel of your Aetherweave interface.",
        icon: Palette,
        color: "text-primary",
        bgColor: "bg-primary/10",
    },
    {
        id: "badges",
        name: "Badge Store",
        description: "Display your achievements. Some badges are earned, others can be bought.",
        icon: Award,
        color: "text-secondary",
        bgColor: "bg-secondary/10",
    },
    {
        id: "avatar-customization",
        name: "Avatar Customization",
        description: "Frames, effects, and more to make your avatar stand out from the crowd.",
        icon: ImageIcon,
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
    },
    {
        id: "chat-effects",
        name: "Chat Effects",
        description: "Purchase unique text effects, animations, and custom emojis for chat.",
        icon: Sparkles,
        color: "text-green-400",
        bgColor: "bg-green-400/10",
    },
    {
        id: "boosters",
        name: "Boosters",
        description: "Activate temporary XP multipliers and other beneficial boosts.",
        icon: Shield,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
    },
    {
        id: "sound-packs",
        name: "Sound Packs",
        description: "Change your UI notification sounds with themed audio packs.",
        icon: Music,
        color: "text-red-400",
        bgColor: "bg-red-400/10",
    },
     {
        id: 'stickers-emotes',
        name: 'Stickers & Emotes',
        description: 'Expand your communication toolkit with unique stickers and emotes.',
        icon: Puzzle,
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10',
    },
     {
        id: 'mini-apps',
        name: 'Mini-Apps',
        description: 'Purchase mini-applications that run within your Aetherweave dashboard.',
        icon: AppWindow,
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-400/10',
    },
     {
        id: 'offline-addons',
        name: 'Offline Addons',
        description: 'Enhance your offline experience with games and tools.',
        icon: WifiOff,
        color: 'text-gray-400',
        bgColor: 'bg-gray-400/10',
    },
    {
        id: "mystery-boxes",
        name: "Mystery Boxes",
        description: "Feeling lucky? Purchase a mystery box for a chance at rare items.",
        icon: Package,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
    },
];

export const storeItems: StoreItem[] = [
    // Themes
    {
        id: 'theme-azure',
        category: 'themes',
        name: 'Azure Matrix',
        description: 'A cool, calming theme of deep blues and glowing cyan, perfect for a focused operator.',
        price: 1000,
        rarity: 'Common',
        icon: Palette,
        imageUrl: 'https://picsum.photos/seed/theme3/600/400',
    },
    {
        id: 'theme-sunset',
        category: 'themes',
        name: 'Synthwave Sunset',
        description: 'A vibrant theme of neon pinks and oranges, reminiscent of a retro-futuristic sunset.',
        price: 2500,
        rarity: 'Rare',
        icon: Palette,
        imageUrl: 'https://picsum.photos/seed/theme1/600/400',
    },
    {
        id: 'theme-chrome',
        category: 'themes',
        name: 'Liquid Chrome',
        description: 'A sleek, reflective theme that gives your UI a polished metallic finish.',
        price: 2000,
        rarity: 'Rare',
        icon: Palette,
        imageUrl: 'https://picsum.photos/seed/theme6/600/400',
    },
    {
        id: 'theme-violet',
        category: 'themes',
        name: 'Violet Overdrive',
        description: 'A high-energy theme with pulsating purples and sharp magenta highlights.',
        price: 3000,
        rarity: 'Cyber Rare',
        icon: Palette,
        imageUrl: 'https://picsum.photos/seed/theme4/600/400',
    },
    {
        id: 'theme-glitch',
        category: 'themes',
        name: 'Glitch Runner',
        description: 'An unstable, glitch-aesthetic theme with scan lines and digital artifacts.',
        price: 5000,
        rarity: 'Epic',
        icon: Palette,
        imageUrl: 'https://picsum.photos/seed/theme2/600/400',
    },
    {
        id: 'theme-samurai',
        category: 'themes',
        name: 'Cyber Samurai',
        description: 'A theme inspired by ancient warrior codes, featuring sharp lines, deep reds, and steel grays.',
        price: 5500,
        rarity: 'Epic',
        icon: Palette,
        imageUrl: 'https://picsum.photos/seed/theme7/600/400',
    },
    {
        id: 'theme-cascade',
        category: 'themes',
        name: 'Code Cascade',
        description: 'The classic digital rain effect, turning your UI into a flowing stream of characters.',
        price: 7500,
        rarity: 'Legendary',
        icon: Palette,
        imageUrl: 'https://picsum.photos/seed/theme5/600/400',
    },
    // Badges
    {
        id: 'badge-supporter',
        category: 'badges',
        name: 'Early Supporter',
        description: 'Show your support for the platform with this exclusive early-phase badge.',
        price: 1000,
        rarity: 'Rare',
        icon: Award,
        unlocksBadge: 'supporter',
        imageUrl: 'https://picsum.photos/seed/badge1/600/400',
    },
    // Avatar Items
    {
        id: 'avatar-frame-neon',
        category: 'avatar-customization',
        name: 'Neon Ring Frame',
        description: 'A glowing circular frame for your avatar, available in multiple colors.',
        price: 800,
        rarity: 'Common',
        icon: ImageIcon,
        imageUrl: 'https://picsum.photos/seed/frame1/600/400',
    },
    {
        id: 'avatar-shadow-neon',
        category: 'avatar-customization',
        name: 'Neon Shadow',
        description: 'A soft, colored glow that emanates from behind your avatar.',
        price: 1200,
        rarity: 'Rare',
        icon: ImageIcon,
        imageUrl: 'https://picsum.photos/seed/shadow1/600/400',
    },
    {
        id: 'avatar-item-holo-ring',
        category: 'avatar-customization',
        name: 'Hologram Ring',
        description: 'A spinning, semi-transparent holographic ring that encircles your avatar.',
        price: 3000,
        rarity: 'Cyber Rare',
        icon: ImageIcon,
        imageUrl: 'https://picsum.photos/seed/holo1/600/400',
    },
    {
        id: 'avatar-effect-glitch',
        category: 'avatar-customization',
        name: 'Glitch Effect',
        description: 'An animated glitching effect that plays over your avatar.',
        price: 1500,
        rarity: 'Epic',
        icon: ImageIcon,
        imageUrl: 'https://picsum.photos/seed/frame2/600/400',
    },
    {
        id: 'avatar-skin-gold',
        category: 'avatar-customization',
        name: 'Liquid Gold Skin',
        description: 'A full-body skin that gives your avatar a shimmering, molten gold appearance.',
        price: 10000,
        rarity: 'Legendary',
        icon: ImageIcon,
        imageUrl: 'https://picsum.photos/seed/skin1/600/400',
    },
    // Chat Effects
    {
        id: 'chat-effect-neon',
        category: 'chat-effects',
        name: 'Neon Glow Text',
        description: 'Make your messages glow with a configurable neon color.',
        price: 750,
        rarity: 'Rare',
        icon: Sparkles,
        imageUrl: 'https://picsum.photos/seed/chat1/600/400',
    },
    {
        id: 'chat-effect-hologram',
        category: 'chat-effects',
        name: 'Hologram Pop',
        description: 'Messages appear with a futuristic holographic projection effect.',
        price: 2000,
        rarity: 'Cyber Rare',
        icon: Sparkles,
        imageUrl: 'https://picsum.photos/seed/chat2/600/400',
    },
    {
        id: 'chat-effect-fire',
        category: 'chat-effects',
        name: 'Fire Message',
        description: 'Engulf your messages in animated flames. Handle with care.',
        price: 5000,
        rarity: 'Legendary',
        icon: Sparkles,
        imageUrl: 'https://picsum.photos/seed/chat3/600/400',
    },
    // Boosters
    {
        id: 'booster-xp-1hr',
        category: 'boosters',
        name: 'XP Boost (1 Hour)',
        description: 'Doubles all XP earned for one hour after activation.',
        price: 500,
        rarity: 'Common',
        icon: Shield,
        imageUrl: 'https://picsum.photos/seed/booster1/600/400',
    },
    {
        id: 'booster-streak-protector',
        category: 'boosters',
        name: 'Streak Protector',
        description: 'Prevents your daily login streak from breaking for one missed day.',
        price: 1500,
        rarity: 'Rare',
        icon: Shield,
        imageUrl: 'https://picsum.photos/seed/booster2/600/400',
    },
    // Stickers & Emotes
    {
        id: 'sticker-pack-cyber-meme',
        category: 'stickers-emotes',
        name: 'Cyber Meme Pack',
        description: 'A pack of 10 animated stickers based on popular net-culture memes.',
        price: 400,
        rarity: 'Common',
        icon: Puzzle,
        imageUrl: 'https://picsum.photos/seed/sticker1/600/400',
    },
    // Sound Packs
    {
        id: 'sound-pack-8bit',
        category: 'sound-packs',
        name: '8-Bit Retro',
        description: 'Classic chiptune sounds for all your notifications and interactions.',
        price: 600,
        rarity: 'Common',
        icon: Music,
        imageUrl: 'https://picsum.photos/seed/sound1/600/400',
    },
    // Mini-Apps
    {
        id: 'miniapp-pomo',
        category: 'mini-apps',
        name: 'Focus Timer',
        description: 'A slick, integrated Pomodoro timer to keep you on task.',
        price: 800,
        rarity: 'Rare',
        icon: AppWindow,
        imageUrl: 'https://picsum.photos/seed/app1/600/400',
    },
    // Offline Addons
    {
        id: 'offline-game-tetris',
        category: 'offline-addons',
        name: 'Block Breaker',
        description: 'A cyberpunk-themed version of the timeless puzzle game, playable offline.',
        price: 1200,
        rarity: 'Rare',
        icon: WifiOff,
        imageUrl: 'https://picsum.photos/seed/offline1/600/400',
    },
    // Mystery Boxes
    {
        id: 'mystery-box-common',
        category: 'mystery-boxes',
        name: 'Chrome Crate',
        description: 'A standard-issue crate with a chance to contain common or rare items.',
        price: 500,
        rarity: 'Common',
        icon: Package,
        imageUrl: 'https://picsum.photos/seed/box1/600/400',
    },
    {
        id: 'mystery-box-legendary',
        category: 'mystery-boxes',
        name: 'Legendary Cache',
        description: 'A rare, high-security cache. Guaranteed to contain at least one Epic item, with a chance for a Legendary.',
        price: 5000,
        rarity: 'Legendary',
        icon: Package,
        imageUrl: 'https://picsum.photos/seed/box2/600/400',
    },
];
