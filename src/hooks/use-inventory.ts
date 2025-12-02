
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { useUser } from '@/hooks/use-user';
import { storeItems, StoreItem } from '@/lib/store-items';

export function useInventory() {
    const { profile, loading: userLoading } = useUser();
    const [inventoryItems, setInventoryItems] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading) {
            setLoading(true);
            return;
        }

        if (!profile || !profile.inventory) {
            setInventoryItems([]);
            setLoading(false);
            return;
        }

        const items = storeItems.filter(item => profile.inventory.includes(item.id));
        setInventoryItems(items);
        setLoading(false);

    }, [profile, userLoading]);

    const equipItem = async (itemId: string) => {
        console.log(`Equipping item ${itemId}`);
        const item = storeItems.find(i => i.id === itemId);
        if (item?.category === 'themes') {
            const { setTheme } = await import('@/components/providers/ThemeProvider').then(m => ({ setTheme: m.useTheme }));
            // Theme will be applied via settings page
        }
    };

    const useItem = async (itemId: string) => {
        console.log(`Using item ${itemId}`);
        // Logic for consumable items
    };

    return { inventoryItems, loading, equipItem, useItem };
}
