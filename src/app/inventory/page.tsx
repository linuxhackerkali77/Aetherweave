
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/use-inventory';
import { Box, Sparkles, Wand2, ArrowUpCircle, Pipette, DollarSign, Users, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { appEventEmitter } from '@/lib/event-emitter';
import { useCommandHub } from '@/hooks/use-command-hub';

export default function InventoryPage() {
    const { inventoryItems, loading, equipItem } = useInventory();
    const { openHub } = useCommandHub();

    const handleItemContextMenu = (e: React.MouseEvent, item: typeof inventoryItems[0]) => {
        e.preventDefault();
        e.stopPropagation();
        openHub(e, {
            type: 'inventory-item',
            data: item,
            actions: [
                { label: 'Equip', icon: 'Wand2', onClick: () => equipItem(item.id) },
                { label: 'Upgrade', icon: 'ArrowUpCircle', onClick: () => {}, disabled: true },
                { label: 'Disassemble', icon: 'Pipette', onClick: () => {}, isDestructive: true },
                { label: 'Sell', icon: 'DollarSign', onClick: () => {}, isDestructive: true },
                { label: 'Trade', icon: 'Users', onClick: () => {}, disabled: true },
            ]
        });
    };
    
    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-headline text-glow flex items-center gap-3">
                    <Box /> My Inventory
                </h1>
            </header>

             {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                             <Skeleton className="aspect-video w-full" />
                             <Skeleton className="h-6 w-3/4" />
                             <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
             )}

            {!loading && inventoryItems.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center h-64 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    <Box className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-headline">Your Inventory is Empty</h3>
                    <p className="text-sm">Visit the AetherStore to purchase new items.</p>
                    <Button variant="outline" className="mt-4" asChild>
                        <Link href="/store">Go to Store</Link>
                    </Button>
                </div>
            )}

            {!loading && inventoryItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {inventoryItems.map(item => (
                        <Card 
                            key={item.id} 
                            className="flex flex-col group overflow-hidden"
                            onMouseEnter={() => appEventEmitter.emit('cursor:rarity-hover:start', item.rarity)}
                            onMouseLeave={() => appEventEmitter.emit('cursor:rarity-hover:end')}
                            onContextMenu={(e) => handleItemContextMenu(e, item)}
                            data-command-hub-trigger
                        >
                            <CardHeader className="p-0">
                                <div className="aspect-video bg-muted/50 flex items-center justify-center relative">
                                    {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw" className="object-cover" />
                                    ) : (
                                        <item.icon className="w-16 h-16 text-primary/50" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 flex flex-col">
                                <h3 className="font-headline text-xl text-glow">{item.name}</h3>
                                <div className="flex justify-between items-center my-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rarity</span>
                                    <span className={cn(
                                        "font-bold",
                                        item.rarity === 'Common' && 'text-gray-400',
                                        item.rarity === 'Rare' && 'text-blue-400',
                                        item.rarity === 'Cyber Rare' && 'text-purple-400',
                                        item.rarity === 'Epic' && 'text-yellow-400',
                                        item.rarity === 'Legendary' && 'text-orange-400',
                                        item.rarity === 'Mythic' && 'text-red-500'
                                    )}>{item.rarity}</span>
                                </div>
                                <div className="mt-auto pt-4">
                                     <Button onClick={() => equipItem(item.id)} className="w-full cyber-button">
                                        <Wand2 className="mr-2 h-4 w-4"/>
                                        Equip Item
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
