
'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, CalendarCheck, Check, DollarSign, Gift, Hexagon, TrendingUp, Zap, ShieldCheck, UploadCloud, Palette, Lock, RefreshCw, Loader2, Target, Star, Clock, Users, MessageSquare, FileText, Phone } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from '@/components/ui/skeleton';
import { achievements, Achievement } from '@/lib/achievements';
import { useUser } from '@/hooks/use-user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dailyQuests, weeklyQuests, seasonalQuests, Quest } from '@/lib/quests';
import CountdownTimer from '@/components/dashboard/countdown-timer';
import { useFirestore } from '@/firebase/provider';
import { doc, updateDoc, increment } from 'firebase/firestore';

const levelRewards = [
    { level: 1, reward: "Base Access", icon: ShieldCheck },
    { level: 5, reward: "File Uploads (10MB)", icon: UploadCloud },
    { level: 10, reward: "New Theme 'Sunset'", icon: Palette },
    { level: 15, reward: "Epic 'Vanguard' Badge", icon: Award },
    { level: 20, reward: "File Uploads (50MB)", icon: UploadCloud },
];

export default function EarningsPage() {
    const { toast } = useToast();
    const { user, profile, loading, setProfile, claimQuestReward, checkAndResetQuests, addXp } = useUser();
    const firestore = useFirestore();
    const [claimingRewards, setClaimingRewards] = useState<{[key: string]: boolean}>({});
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [claimingBonus, setClaimingBonus] = useState(false);

    const [nextResets, setNextResets] = useState<{daily: Date, weekly: Date, seasonal: Date}>({
        daily: new Date(),
        weekly: new Date(),
        seasonal: new Date(),
    });

    useEffect(() => {
        if (profile) {
            checkAndResetQuests();
        }
    }, [profile, checkAndResetQuests]);
    
    useEffect(() => {
        const now = new Date();
        const dailyReset = new Date(now);
        dailyReset.setUTCHours(24, 0, 0, 0);

        const weeklyReset = new Date(now);
        const dayOfWeek = weeklyReset.getUTCDay(); // 0 = Sunday
        const daysUntilMonday = (8 - dayOfWeek) % 7;
        weeklyReset.setUTCDate(weeklyReset.getUTCDate() + daysUntilMonday);
        weeklyReset.setUTCHours(0, 0, 0, 0);

        const seasonalReset = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
        
        setNextResets({ daily: dailyReset, weekly: weeklyReset, seasonal: seasonalReset });

    }, [profile?.questResets]);

    const xpForNextLevel = profile ? profile.level * 1000 + 1000 : 1000;
    const xpPercentage = profile ? (profile.xp / xpForNextLevel) * 100 : 0;
    
    const isAchievementUnlocked = (achievementId: string) => {
        return profile?.badgesUnlocked.includes(achievementId) ?? false;
    };
    
    const canUnlockBadge = (badgeLevel: number) => {
        return (profile?.level ?? 0) >= badgeLevel;
    }

    const getQuestProgress = (quest: Quest, profile: any) => {
        if (!profile) return { completed: false, claimed: false, progress: '...' };
    
        const claimed = profile.questsCompleted?.includes(quest.id) ?? false;
        
        let isCompleted = false;
        let progressText = '';
        
        switch (quest.id) {
            case 'daily-login-1':
                isCompleted = true; 
                progressText = '1 / 1';
                break;
            case 'daily-msg-1':
                isCompleted = (profile.messagesSent ?? 0) >= 10;
                progressText = `${Math.min(profile.messagesSent ?? 0, 10)} / 10`;
                break;
             case 'daily-note-1':
                isCompleted = (profile.notesCreated ?? 0) >= 1;
                progressText = `${Math.min(profile.notesCreated ?? 0, 1)} / 1`;
                break;
            case 'weekly-friends-1':
                isCompleted = (profile.friends ?? 0) >= 3;
                progressText = `${Math.min(profile.friends ?? 0, 3)} / 3`;
                break;
            case 'seasonal-lvl-1':
                isCompleted = profile.level >= 10;
                progressText = `${Math.min(profile.level, 10)} / 10`;
                break;
            // Default for quests that are simple "do it once" or not tracked via simple stats
            case 'daily-react-1':
            case 'weekly-msg-1':
            case 'weekly-files-1':
            case 'weekly-call-1':
            case 'seasonal-tasks-1':
            case 'seasonal-badges-1':
                isCompleted = claimed; // For now, if we can't track progress, completion is just if it's been claimed.
                progressText = claimed ? 'Complete' : '0 / 1';
                break;
            default:
                isCompleted = claimed;
                progressText = claimed ? 'Complete' : '...';
        }
    
        return { completed: isCompleted, claimed, progress: progressText };
    };

    const hasClaimableRewards = (quests: Quest[], profile: any): boolean => {
        if (!profile) return false;
        return quests.some(quest => {
            const { completed, claimed } = getQuestProgress(quest, profile);
            return completed && !claimed;
        });
    };

    const handleClaimReward = async (quest: Quest) => {
        if (profile?.questsCompleted?.includes(quest.id)) {
            toast({
              title: "Already Claimed",
              description: "You have already claimed the reward for this quest.",
            });
            return;
        }
        
        setClaimingRewards(prev => ({ ...prev, [quest.id]: true }));
        
        try {
            await claimQuestReward(quest);
            toast({
                title: 'Reward Claimed!',
                description: `You earned ${quest.xp} XP${quest.badgeReward ? ' and a new badge!' : '.'}`
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Claim Failed',
                description: 'Something went wrong. Please try again.'
            });
        } finally {
            setClaimingRewards(prev => ({ ...prev, [quest.id]: false }));
        }
    };

    const handleClaimAllRewards = async (quests: Quest[]) => {
        if (!profile) return;
        
        const claimableQuests = quests.filter(quest => {
            const { completed, claimed } = getQuestProgress(quest, profile);
            return completed && !claimed;
        });
        
        if (claimableQuests.length === 0) {
            toast({ title: 'No Rewards', description: 'No claimable rewards available.' });
            return;
        }
        
        setClaimingRewards(prev => {
            const newState = { ...prev };
            claimableQuests.forEach(quest => newState[quest.id] = true);
            return newState;
        });
        
        try {
            for (const quest of claimableQuests) {
                await claimQuestReward(quest);
            }
            
            const totalXP = claimableQuests.reduce((sum, quest) => sum + quest.xp, 0);
            toast({
                title: 'All Rewards Claimed!',
                description: `You earned ${totalXP} XP from ${claimableQuests.length} quests!`
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Claim Failed',
                description: 'Some rewards could not be claimed. Please try again.'
            });
        } finally {
            setClaimingRewards({});
        }
    };

    const handleRefreshQuests = async () => {
        setRefreshing(true);
        try {
            await checkAndResetQuests();
            toast({ title: 'Quests Refreshed', description: 'Quest progress has been updated.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Refresh Failed', description: 'Could not refresh quests.' });
        } finally {
            setRefreshing(false);
        }
    };

    const canClaimDailyBonus = () => {
        if (!profile?.lastBonusClaim) return true;
        const lastClaim = profile.lastBonusClaim.toDate();
        const today = new Date();
        return lastClaim.toDateString() !== today.toDateString();
    };

    const handleDailyBonus = async () => {
        if (!user || !firestore || !canClaimDailyBonus()) {
            toast({ title: 'Already Claimed', description: 'Daily bonus already claimed today.' });
            return;
        }
        
        setClaimingBonus(true);
        const bonusXP = 100;
        
        try {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                xp: increment(bonusXP),
                lastBonusClaim: new Date()
            });
            
            toast({
                title: 'Daily Bonus Claimed!',
                description: `You earned ${bonusXP} bonus XP!`
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Bonus Failed', description: 'Could not claim daily bonus.' });
        } finally {
            setClaimingBonus(false);
        }
    };

    const sortedAchievements = useMemo(() => {
        return [...achievements].sort((a, b) => a.level - b.level);
    }, []);

    const renderQuestList = (quests: Quest[], type: 'daily' | 'weekly' | 'seasonal') => {
        return (
            <div className="space-y-3">
                <div className='text-right'>
                    <CountdownTimer expiryTimestamp={nextResets[type]} />
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold capitalize">{type} Quests</h3>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRefreshQuests}
                            disabled={refreshing}
                        >
                            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        </Button>
                        <Button 
                            size="sm" 
                            onClick={() => handleClaimAllRewards(quests)}
                            disabled={!hasClaimableRewards(quests, profile) || Object.values(claimingRewards).some(Boolean)}
                        >
                            {Object.values(claimingRewards).some(Boolean) ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Claiming...</>
                            ) : (
                                'Claim All'
                            )}
                        </Button>
                    </div>
                </div>
                {quests.map((quest) => {
                    if (!profile) return null;
                    const { completed, claimed, progress } = getQuestProgress(quest, profile);
                    const canClaim = completed && !claimed;
                    const isClaiming = claimingRewards[quest.id];
                    
                    const getQuestIcon = () => {
                        if (quest.id.includes('msg')) return MessageSquare;
                        if (quest.id.includes('note')) return FileText;
                        if (quest.id.includes('friends')) return Users;
                        if (quest.id.includes('call')) return Phone;
                        if (quest.id.includes('login')) return CalendarCheck;
                        return Target;
                    };
                    
                    const QuestIcon = getQuestIcon();
                    
                    return (
                         <div key={quest.id} className={cn(
                             "flex items-center justify-between p-4 rounded-lg transition-all border", 
                             completed ? "bg-green-500/10 border-green-500/50" : "bg-muted/50 border-border",
                             canClaim && "ring-2 ring-primary/50"
                         )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-full",
                                    completed ? "bg-green-500/20" : "bg-muted"
                                )}>
                                    <QuestIcon className={cn(
                                        "w-5 h-5",
                                        completed ? "text-green-500" : "text-muted-foreground"
                                    )} />
                                </div>
                                <div>
                                    <p className="font-semibold">{quest.text}</p>
                                    <p className="text-sm text-muted-foreground">{quest.description}</p>
                                    {!completed && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Progress value={(parseInt(progress.split('/')[0]) / parseInt(progress.split('/')[1])) * 100} className="w-20 h-2" />
                                            <span className="text-xs text-muted-foreground font-mono">{progress}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <Badge variant="secondary" className="text-sm font-bold">
                                    <Star className="w-3 h-3 mr-1" />
                                    {quest.xp} XP
                                </Badge>
                                {completed && claimed && (
                                    <Badge variant="outline" className="text-green-600">
                                        <Check className="w-3 h-3 mr-1" />
                                        Claimed
                                    </Badge>
                                )}
                                {canClaim && (
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleClaimReward(quest)}
                                        disabled={isClaiming}
                                        className="cyber-button"
                                    >
                                        {isClaiming ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Claiming...</>
                                        ) : (
                                            <>Claim <Gift className="w-4 h-4 ml-1" /></>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };


    if (loading) {
        return (
            <div className="space-y-8">
                <header className="flex items-center justify-between">
                     <h1 className="text-3xl font-headline text-glow">Rewards & Earnings</h1>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-40" />
                        <Skeleton className="h-64" />
                    </div>
                    <div className="space-y-6">
                         <Skeleton className="h-40" />
                         <Skeleton className="h-40" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between gap-4">
                 <h1 className="text-3xl font-headline text-glow">Rewards Hub</h1>
                 <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleDailyBonus}
                        disabled={!canClaimDailyBonus() || claimingBonus}
                    >
                        {claimingBonus ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Claiming...</>
                        ) : !canClaimDailyBonus() ? (
                            <><Check className="mr-2 h-4 w-4" /> Claimed Today</>
                        ) : (
                            <><Gift className="mr-2 h-4 w-4" /> Daily Bonus</>
                        )}
                    </Button>
                    <Button variant="outline" onClick={() => {}}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Analytics
                    </Button>
                 </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Zap className="text-primary"/> Level & XP</CardTitle>
                             <CardDescription>Complete tasks and engage with the community to level up and unlock rewards.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-3xl font-bold text-primary">Level {profile?.level ?? 1}</p>
                                    <p className="text-sm text-muted-foreground">Total XP Earned: {((profile?.level ?? 1) - 1) * 1000 + (profile?.xp ?? 0)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">{profile?.xp ?? 0} / {xpForNextLevel} XP</p>
                                    <p className="text-xs text-muted-foreground">{xpForNextLevel - (profile?.xp ?? 0)} XP to next level</p>
                                </div>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger className="w-full">
                                        <Progress value={xpPercentage} className="h-4" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{xpPercentage.toFixed(0)}% to next level</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardContent>
                    </Card>

                    <Card>
                         <Tabs defaultValue="daily">
                            <CardHeader>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="daily" className="relative">
                                        Daily
                                        {hasClaimableRewards(dailyQuests, profile) && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary neon-glow-primary"></span>}
                                    </TabsTrigger>
                                    <TabsTrigger value="weekly" className="relative">
                                        Weekly
                                        {hasClaimableRewards(weeklyQuests, profile) && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary neon-glow-primary"></span>}
                                    </TabsTrigger>
                                    <TabsTrigger value="seasonal" className="relative">
                                        Seasonal
                                        {hasClaimableRewards(seasonalQuests, profile) && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary neon-glow-primary"></span>}
                                    </TabsTrigger>
                                </TabsList>
                            </CardHeader>
                            <CardContent>
                                <TabsContent value="daily">
                                    {renderQuestList(dailyQuests, 'daily')}
                                </TabsContent>
                                <TabsContent value="weekly">
                                    {renderQuestList(weeklyQuests, 'weekly')}
                                </TabsContent>
                                <TabsContent value="seasonal">
                                    {renderQuestList(seasonalQuests, 'seasonal')}
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                    
                </div>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award className="text-primary"/> Achievements & Badges</CardTitle>
                    <CardDescription>Unlock badges by completing achievements across the platform.</CardDescription>
                </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sortedAchievements.map(ach => {
                        const unlocked = isAchievementUnlocked(ach.id);
                        const canBeUnlocked = canUnlockBadge(ach.level);
                        return (
                            <TooltipProvider key={ach.id}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className={cn(
                                            "aspect-square flex flex-col items-center justify-center text-center p-4 rounded-lg border-2 transition-all",
                                            unlocked ? "bg-secondary/20 border-secondary neon-border-secondary cursor-pointer" : 
                                            canBeUnlocked ? "bg-muted/50 border-border" :
                                            "bg-muted/20 border-border/50 filter grayscale opacity-60"
                                        )}>
                                            <div className="relative">
                                                <Hexagon className={cn("w-16 h-16", unlocked ? "text-secondary" : "text-muted-foreground")} fill="currentColor" fillOpacity={0.1}/>
                                                <ach.icon className={cn("w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", unlocked ? "text-secondary-foreground" : "text-muted-foreground")}/>
                                                {!unlocked && !canBeUnlocked && <Lock className="w-5 h-5 absolute bottom-1 right-1 text-muted-foreground" />}
                                            </div>
                                            <p className={cn("mt-2 font-semibold", unlocked ? "text-secondary-foreground" : "text-muted-foreground")}>{ach.name}</p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-xs">
                                        <p className="font-bold text-base">{ach.name}</p>
                                        <p>{ach.description}</p>
                                        {unlocked ? (
                                            <p className="text-green-400 font-bold mt-1">Unlocked!</p>
                                        ) : canBeUnlocked ? (
                                            <p className="text-yellow-400 font-bold mt-1">Locked (Requirement not met)</p>
                                        ) : (
                                            <p className="text-red-400 font-bold mt-1">Locked (Requires Level {ach.level})</p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
