
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import GamingChatArea from './components/GamingChatArea';
import GamingMemberList from './components/GamingMemberList';

export default function GamingDashboardPage() {
    const { user, profile, setProfile } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [gamingUsername, setGamingUsername] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile && !profile.gaming?.username) {
            setShowUsernameModal(true);
        }
    }, [profile]);

    const handleSaveGamingUsername = async () => {
        if (!user || !firestore || !gamingUsername) return;
        
        setIsSaving(true);
        
        // 1. Validate for uniqueness
        setIsCheckingUsername(true);
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('gaming.username', '==', gamingUsername.toLowerCase()));
        const querySnapshot = await getDocs(q);
        setIsCheckingUsername(false);

        if (!querySnapshot.empty) {
            toast({
                variant: 'destructive',
                title: 'Username Taken',
                description: 'That gaming username is already in use. Please choose another.',
            });
            setIsSaving(false);
            return;
        }

        // 2. Save the username
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            await setDoc(userDocRef, {
                gaming: {
                    username: gamingUsername
                }
            }, { merge: true });

            // Optimistically update local profile
            if(profile) {
                setProfile({
                    ...profile,
                    gaming: {
                        ...profile.gaming,
                        username: gamingUsername,
                    },
                });
            }

            toast({
                title: 'Gaming Username Set!',
                description: `Welcome to the Gaming Hub, ${gamingUsername}!`,
            });
            setShowUsernameModal(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Could not save username: ${error.message}`,
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="flex flex-1 p-4 gap-4">
            <GamingChatArea />
            <GamingMemberList activeSpaceId={null} />

            <Dialog open={showUsernameModal} onOpenChange={setShowUsernameModal}>
                <DialogContent className="sm:max-w-[425px] glass-card" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Set Your Gaming Username</DialogTitle>
                        <DialogDescription>
                            This name will be used across the entire Aetherweave gaming network. It must be unique.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gaming-username" className="text-right">
                                Username
                            </Label>
                            <Input
                                id="gaming-username"
                                value={gamingUsername}
                                onChange={(e) => setGamingUsername(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g., NeonBlade"
                            />
                        </div>
                    </div>
                    <Button onClick={handleSaveGamingUsername} disabled={isSaving || !gamingUsername}>
                        {(isSaving || isCheckingUsername) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isCheckingUsername ? 'Checking...' : isSaving ? 'Saving...' : 'Save Username'}
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
