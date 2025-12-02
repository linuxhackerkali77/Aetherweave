
'use client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Zap, Shield, Calendar, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase/provider';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { achievements } from '@/lib/achievements';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

const getDerivedStatus = (profile: UserProfile | null): {label: string, color: string, isOnline: boolean} => {
    if (!profile) return {label: 'Offline', color: 'bg-muted-foreground', isOnline: false};
    if (profile.status && profile.status !== 'Online' && profile.status !== 'Offline') {
        return {label: profile.status, color: 'bg-yellow-500', isOnline: true};
    }
    if (profile.lastSeen && profile.lastSeen.toDate) {
        const lastSeenDate = profile.lastSeen.toDate();
        const minutesSinceSeen = (new Date().getTime() - lastSeenDate.getTime()) / (1000 * 60);
        if (minutesSinceSeen < 5) {
            return {label: 'Online', color: 'bg-green-500', isOnline: true};
        }
    }
    return {label: 'Offline', color: 'bg-muted-foreground', isOnline: false};
}

interface UserProfileModalProps {
    userId: string;
    onOpenChange: (isOpen: boolean) => void;
}

export default function UserProfileModal({ userId, onOpenChange }: UserProfileModalProps) {
    const firestore = useFirestore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        const profileDocRef = doc(firestore, 'users', userId);
        const unsubscribe = onSnapshot(profileDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfile({...(docSnap.data() as UserProfile), id: docSnap.id });
            } else {
                setProfile(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile for modal:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, firestore]);
    
    const xpForNextLevel = (profile?.level ?? 0) * 1000 + 1000;
    const xpPercentage = profile ? (profile.xp / xpForNextLevel) * 100 : 0;
    const derivedStatus = getDerivedStatus(profile);
    const accountCreationDate = useMemo(() => {
        if (profile?.createdAt) {
            try {
                if (profile.createdAt.toDate) {
                    return format(profile.createdAt.toDate(), 'MMMM d, yyyy');
                }
                return format(new Date(profile.createdAt as any), 'MMMM d, yyyy');
            } catch (e) { return "N/A"; }
        }
        return 'N/A';
    }, [profile?.createdAt]);

    const isAchievementUnlocked = (achievementId: string) => {
        return profile?.badgesUnlocked?.includes(achievementId) ?? false;
    };
    
    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] glass-card">
                {loading || !profile ? (
                    <div className="flex flex-col items-center p-6">
                        <Loader2 className="w-12 h-12 animate-spin text-primary"/>
                        <p className="mt-4 text-muted-foreground">Loading Operator Dossier...</p>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="text-center items-center">
                            <div className="relative">
                                <Avatar className="w-24 h-24 border-4 border-primary neon-glow-primary">
                                    <AvatarImage src={profile.photoURL ?? ''} />
                                    <AvatarFallback className="text-3xl">{profile.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className={cn("absolute top-1 right-1 w-4 h-4 rounded-full border-2 border-background", derivedStatus.color)}></div>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{derivedStatus.label}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <DialogTitle className="text-2xl font-headline text-glow mt-4">{profile.displayName}</DialogTitle>
                            <DialogDescription>@{profile.username}</DialogDescription>
                            <p className="text-sm text-muted-foreground pt-2">{profile.bio}</p>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>XP</span>
                                    <span>{profile.xp} / {xpForNextLevel}</span>
                                </div>
                                <Progress value={xpPercentage} className="h-2" />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div><p className="font-bold text-lg text-glow">{profile.level}</p><p className="text-xs text-muted-foreground">Level</p></div>
                                <div><p className="font-bold text-lg text-glow">{'N/A'}</p><p className="text-xs text-muted-foreground">Reputation</p></div>
                                <div><p className="font-bold text-lg text-glow">{profile.trustScore ?? 0}</p><p className="text-xs text-muted-foreground">Trust</p></div>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground justify-center">
                                <Calendar className="w-3 h-3 mr-1.5"/>
                                Operator since {accountCreationDate}
                            </div>
                            <div className="border-t border-border pt-4">
                                <h4 className="text-center font-semibold mb-2 text-muted-foreground">Badges</h4>
                                <div className="flex justify-center flex-wrap gap-2">
                                    {achievements.slice(0, 5).map(badge => {
                                        const unlocked = isAchievementUnlocked(badge.id);
                                        if (unlocked) {
                                            return (
                                                <TooltipProvider key={badge.id}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="p-2 bg-secondary/20 rounded-full border-2 border-secondary">
                                                                <badge.icon className="w-5 h-5 text-secondary-foreground" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>{badge.name}</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        }
                                        return null;
                                    })}
                                    {profile.badgesUnlocked.length === 0 && <p className="text-xs text-muted-foreground">No badges earned yet.</p>}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

    