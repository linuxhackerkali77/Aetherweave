
'use client';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storeItems, storeCategories, StoreItem } from '@/lib/store-items';
import { CheckCircle, Loader2, ShoppingCart, Eye, Heart, BarChart, Wand2 } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { appEventEmitter } from '@/lib/event-emitter';
import { useCommandHub } from '@/hooks/use-command-hub';

export default function StoreSectionPage() {
    const params = useParams();
    const { section } = params;
    const { profile, purchaseItem } = useUser();
    const { toast } = useToast();
    const [purchasingId, setPurchasingId] = useState<string | null>(null);
    const { openHub } = useCommandHub();

    const category = storeCategories.find(cat => cat.id === section);
    const items = storeItems.filter(item => item.category === section);

    const handlePurchase = async (item: StoreItem) => {
        if (!profile) return;
        setPurchasingId(item.id);
        try {
            await purchaseItem(item);
            toast({
                title: 'Purchase Successful!',
                description: `${item.name} has been added to your inventory.`,
            });
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Purchase Failed',
                description: error.message,
            });
        } finally {
            setPurchasingId(null);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, item: StoreItem) => {
        e.preventDefault();
        e.stopPropagation();
        const owned = hasItem(item.id);
        openHub(e, {
            type: 'store-item',
            data: item,
            actions: [
                {
                    label: 'Buy with EXP',
                    icon: 'ShoppingCart',
                    onClick: () => handlePurchase(item),
                    disabled: owned || (profile?.xp ?? 0) < item.price,
                },
                 { label: 'Preview', icon: 'Eye', onClick: () => {}, disabled: true },
                 { label: 'Add to wishlist', icon: 'Heart', onClick: () => {} },
                 { label: 'Compare stats', icon: 'BarChart', onClick: () => {}, disabled: true },
                 { label: 'Skin preview', icon: 'Wand2', onClick: () => {}, disabled: true },
            ],
        });
    };
    
    const hasItem = (itemId: string) => {
        return profile?.inventory?.includes(itemId) ?? false;
    }

    if (!category) {
        return <div className="text-center text-muted-foreground">Store section not found.</div>;
    }

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div className='flex items-center gap-4'>
                    <Link href="/store"><Button variant="outline" size="icon" className="h-10 w-10">&larr;</Button></Link>
                     <h1 className="text-3xl font-headline text-glow flex items-center gap-3">
                        <category.icon className={cn("w-8 h-8", category.color)}/>
                        {category.name}
                    </h1>
                </div>
                 <p className="text-lg text-primary font-bold">Your XP: {profile?.xp ?? '...'}</p>
            </header>
            
            <p className="text-muted-foreground max-w-2xl">{category.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => {
                    const owned = hasItem(item.id);
                    const isPurchasing = purchasingId === item.id;
                    return (
                    <Card key={item.id} className="flex flex-col group overflow-hidden"
                        onMouseEnter={() => appEventEmitter.emit('cursor:rarity-hover:start', item.rarity)}
                        onMouseLeave={() => appEventEmitter.emit('cursor:rarity-hover:end')}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                        data-command-hub-trigger
                    >
                        <CardHeader className="p-0">
                            <div className="aspect-video bg-muted/50 flex items-center justify-center relative overflow-hidden">
                                {item.imageUrl ? (
                                     <Image src={item.imageUrl} alt={item.name} layout="fill" className="object-cover" />
                                ) : (
                                    <item.icon className="w-16 h-16 text-primary/50" />
                                )}
                                {owned && (
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="p-4 rounded-full bg-green-500/20 border-2 border-green-500">
                                            <CheckCircle className="w-12 h-12 text-green-400" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-1 flex flex-col">
                            <h3 className="font-headline text-xl text-glow">{item.name}</h3>
                            <p className="text-sm text-muted-foreground flex-1 my-2">{item.description}</p>
                             <div className="flex justify-between items-center mb-4">
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
                            <div className="flex items-center justify-between mt-auto">
                                <p className="text-lg font-bold text-primary">{item.price} XP</p>
                                <Button onClick={() => handlePurchase(item)} className="cyber-button" disabled={owned || isPurchasing || !profile || profile.xp < item.price}>
                                    {isPurchasing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : owned ? <CheckCircle className="mr-2 h-4 w-4"/> : <ShoppingCart className="mr-2 h-4 w-4"/>}
                                    {owned ? 'Owned' : isPurchasing ? 'Processing...' : 'Purchase'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    )
                })}
            </div>
        </div>
    );
}
