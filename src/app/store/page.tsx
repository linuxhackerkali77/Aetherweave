'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ShoppingBag, Package, Star, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { storeCategories, storeItems, StoreItem } from "@/lib/store-items";
import { useUser } from "@/hooks/use-user";
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface PurchaseState {
  [itemId: string]: boolean;
}

const rarityColors = {
  'Common': 'bg-gray-500',
  'Rare': 'bg-blue-500',
  'Epic': 'bg-purple-500',
  'Cyber Rare': 'bg-cyan-500',
  'Legendary': 'bg-yellow-500',
  'Mythic': 'bg-red-500'
};

export default function StorePage() {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
            <ShoppingBag className="w-24 h-24 text-primary animate-pulse" />
            <h1 className="text-4xl font-headline text-glow">Coming Soon</h1>
            <p className="text-muted-foreground text-center max-w-md">
                The AetherStore is currently under construction. Check back soon for exclusive items, themes, and upgrades!
            </p>
        </div>
    );
}

function StorePageOld() {
    const { profile, user, updateProfile } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [purchasing, setPurchasing] = useState<PurchaseState>({});
    const [inventory, setInventory] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('browse');

    useEffect(() => {
        if (profile?.inventory) {
            setInventory(profile.inventory);
        }
    }, [profile]);

    const handleItemSelect = (itemId: string) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handlePurchase = async (item: StoreItem) => {
        if (!user || !firestore || !profile) return;
        
        if (profile.xp < item.price) {
            toast({ variant: 'destructive', title: 'Insufficient XP', description: `You need ${item.price} XP to purchase this item.` });
            return;
        }

        if (inventory.includes(item.id)) {
            toast({ variant: 'destructive', title: 'Already Owned', description: 'You already own this item.' });
            return;
        }

        setPurchasing(prev => ({ ...prev, [item.id]: true }));
        
        try {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                xp: profile.xp - item.price,
                inventory: arrayUnion(item.id)
            });
            
            await updateProfile({ 
                xp: profile.xp - item.price,
                inventory: [...inventory, item.id]
            });
            
            setInventory(prev => [...prev, item.id]);
            toast({ title: 'Purchase Successful!', description: `${item.name} has been added to your inventory.` });
        } catch (error) {
            console.error('Purchase failed:', error);
            toast({ variant: 'destructive', title: 'Purchase Failed', description: 'Something went wrong. Please try again.' });
        } finally {
            setPurchasing(prev => ({ ...prev, [item.id]: false }));
        }
    };

    const handleBulkPurchase = async () => {
        if (!user || !firestore || !profile || selectedItems.length === 0) return;
        
        const itemsToPurchase = storeItems.filter(item => selectedItems.includes(item.id) && !inventory.includes(item.id));
        const totalCost = itemsToPurchase.reduce((sum, item) => sum + item.price, 0);
        
        if (profile.xp < totalCost) {
            toast({ variant: 'destructive', title: 'Insufficient XP', description: `You need ${totalCost} XP to purchase selected items.` });
            return;
        }

        setPurchasing(prev => {
            const newState = { ...prev };
            selectedItems.forEach(id => newState[id] = true);
            return newState;
        });
        
        try {
            const userRef = doc(firestore, 'users', user.uid);
            const newInventory = [...inventory, ...itemsToPurchase.map(item => item.id)];
            
            await updateDoc(userRef, {
                xp: profile.xp - totalCost,
                inventory: newInventory
            });
            
            await updateProfile({ 
                xp: profile.xp - totalCost,
                inventory: newInventory
            });
            
            setInventory(newInventory);
            setSelectedItems([]);
            toast({ title: 'Bulk Purchase Successful!', description: `${itemsToPurchase.length} items added to your inventory.` });
        } catch (error) {
            console.error('Bulk purchase failed:', error);
            toast({ variant: 'destructive', title: 'Purchase Failed', description: 'Something went wrong. Please try again.' });
        } finally {
            setPurchasing({});
        }
    };

    const ItemCard = ({ item }: { item: StoreItem }) => {
        const isOwned = inventory.includes(item.id);
        const isSelected = selectedItems.includes(item.id);
        const isPurchasing = purchasing[item.id];
        const canAfford = (profile?.xp ?? 0) >= item.price;

        return (
            <Card 
                className={cn(
                    "group cursor-pointer transition-all duration-200 hover:scale-105",
                    isSelected && "ring-2 ring-primary",
                    isOwned && "opacity-75 bg-green-500/10"
                )}
                onClick={() => !isOwned && handleItemSelect(item.id)}
            >
                <CardHeader className="pb-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                        {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw" className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <item.icon className="w-12 h-12 text-muted-foreground" />
                            </div>
                        )}
                        {isOwned && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                        {isSelected && !isOwned && (
                            <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                                <Star className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-headline">{item.name}</CardTitle>
                        <Badge className={cn("text-xs", rarityColors[item.rarity])}>
                            {item.rarity}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">{item.price} XP</span>
                        <Button 
                            size="sm" 
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePurchase(item);
                            }}
                            disabled={isOwned || isPurchasing || !canAfford}
                            className={cn(
                                isOwned && "bg-green-500 hover:bg-green-600",
                                !canAfford && !isOwned && "opacity-50"
                            )}
                        >
                            {isPurchasing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isOwned ? (
                                <>Owned <Check className="w-4 h-4 ml-1" /></>
                            ) : !canAfford ? (
                                <>Can't Afford <X className="w-4 h-4 ml-1" /></>
                            ) : (
                                'Purchase'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const selectedItemsData = storeItems.filter(item => selectedItems.includes(item.id) && !inventory.includes(item.id));
    const totalCost = selectedItemsData.reduce((sum, item) => sum + item.price, 0);
    const ownedItems = storeItems.filter(item => inventory.includes(item.id));

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-headline text-glow flex items-center gap-3">
                    <ShoppingBag /> AetherStore
                </h1>
                <div className="flex items-center gap-4">
                    <p className="text-lg text-primary font-bold">XP: {profile?.xp ?? '...'}</p>
                    <Badge variant="secondary">
                        <Package className="w-4 h-4 mr-1" />
                        {inventory.length} Items
                    </Badge>
                </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="browse">Browse Store</TabsTrigger>
                    <TabsTrigger value="inventory">My Inventory ({inventory.length})</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>

                <TabsContent value="browse" className="space-y-6">
                    {selectedItems.length > 0 && (
                        <Card className="border-primary">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Selected Items ({selectedItemsData.length})</span>
                                    <Button 
                                        onClick={() => setSelectedItems([])}
                                        variant="ghost" 
                                        size="sm"
                                    >
                                        Clear All
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Total Cost: <span className="text-primary font-bold">{totalCost} XP</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            After purchase: {(profile?.xp ?? 0) - totalCost} XP remaining
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={handleBulkPurchase}
                                        disabled={selectedItemsData.length === 0 || (profile?.xp ?? 0) < totalCost || Object.values(purchasing).some(Boolean)}
                                        className="cyber-button"
                                    >
                                        {Object.values(purchasing).some(Boolean) ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Purchasing...</>
                                        ) : (
                                            <>Purchase All ({selectedItemsData.length})</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {storeItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                    {ownedItems.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-headline mb-2">No Items Yet</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Your purchased items will appear here. Start shopping to build your collection!
                                </p>
                                <Button onClick={() => setActiveTab('browse')}>
                                    Browse Store
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {ownedItems.map((item) => (
                                <ItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="categories">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {storeCategories.map((category) => {
                            const categoryItems = storeItems.filter(item => item.category === category.id);
                            const ownedInCategory = categoryItems.filter(item => inventory.includes(item.id)).length;
                            
                            return (
                                <Card key={category.id} className="flex flex-col group overflow-hidden">
                                    <CardHeader className="flex-row items-start gap-4 pb-4">
                                        <div className={cn("w-12 h-12 flex items-center justify-center rounded-lg", category.bgColor)}>
                                            <category.icon className={cn("w-6 h-6", category.color)} />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl font-headline">{category.name}</CardTitle>
                                            <Badge variant="outline" className="mt-1">
                                                {ownedInCategory}/{categoryItems.length} owned
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-between">
                                        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                                        <Link href={`/store/${category.id}`} className="mt-auto">
                                            <Button className="w-full cyber-button">
                                                Browse Section <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
