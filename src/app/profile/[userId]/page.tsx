
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile, useUser } from '@/hooks/use-user';
import { Github, Twitter, Linkedin, Hexagon, Lock, Award, Zap, Shield, TrendingUp, Calendar, MessageSquare, StickyNote, FileUp, Box, UserPlus, Loader2, UserCheck, Clock, UserX, Circle, Gamepad2, Users, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, formatDistanceToNowStrict } from 'date-fns';
import { achievements } from '@/lib/achievements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import Link from 'next/link';
import { useConnections } from '@/hooks/use-connections';
import { useToast } from '@/hooks/use-toast';

const getDerivedStatus = (profile: UserProfile | null): {label: string, color: string, isOnline: boolean} => {
    if (!profile) return {label: 'Offline', color: 'bg-muted-foreground', isOnline: false};
    
    // Respect user-set status first
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

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const firestore = useFirestore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useUser();
  const { connections, sendFriendRequest, acceptFriendRequest, removeConnection, loading: connectionsLoading } = useConnections();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const profileDoc = doc(firestore, 'users', userId);
    const unsub = onSnapshot(profileDoc, (docSnap) => {
      if (docSnap.exists()) {
        setProfile({...(docSnap.data() as UserProfile), id: docSnap.id});
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [userId, firestore]);

  const connectionStatus = useMemo(() => {
    if (!currentUser || !profile || currentUser.uid === profile.id) return 'self';
    const connection = connections.find(c => c.id === profile.id);
    if (!connection) return 'not_connected';
    return connection.status;
  }, [connections, currentUser, profile]);
  
  const xpForNextLevel = (profile?.level ?? 0) * 1000 + 1000;
  const xpPercentage = profile ? (profile.xp / xpForNextLevel) * 100 : 0;
  const accountCreationDate = useMemo(() => {
    if (profile?.createdAt) {
        try {
            if (profile.createdAt.toDate) {
                return format(profile.createdAt.toDate(), 'MMMM d, yyyy');
            }
            return format(new Date(profile.createdAt as any), 'MMMM d, yyyy');
        } catch (e) {
            console.error("Error formatting date:", e);
            return "N/A";
        }
    }
    return 'N/A';
  }, [profile?.createdAt]);

  const isAchievementUnlocked = (achievementId: string) => {
    return profile?.badgesUnlocked?.includes(achievementId) ?? false;
  };
  
  const canUnlockBadge = (badgeLevel: number) => {
    return (profile?.level ?? 0) >= badgeLevel;
  }

  const handleSendRequest = async () => {
      if (!profile) return;
      setActionLoading(true);
      try {
          await sendFriendRequest(profile.id);
          toast({ title: 'Success', description: 'Friend request sent.'});
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
          setActionLoading(false);
      }
  }

  const handleAcceptRequest = async () => {
      if (!profile) return;
      setActionLoading(true);
      try {
          await acceptFriendRequest(profile.id);
          toast({ title: 'Success', description: 'Friend request accepted.'});
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
          setActionLoading(false);
      }
  }

   const handleRemoveConnection = async () => {
      if (!profile) return;
      setActionLoading(true);
      try {
          await removeConnection(profile.id);
          toast({ title: 'Success', description: 'Connection removed.'});
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
          setActionLoading(false);
      }
  }

  const renderConnectionButton = () => {
    if (connectionsLoading) return <Skeleton className="h-9 w-24" />;

    const connection = connections.find(c => c.id === profile?.id);

    switch (connectionStatus) {
        case 'friends':
            return <Button size="sm" variant="secondary" disabled><UserCheck className="mr-2"/> Friends</Button>;
        case 'pending':
            if (connection?.requestedBy === currentUser?.uid) {
                return <Button size="sm" variant="secondary" disabled><Clock className="mr-2"/> Pending</Button>;
            } else {
                 return <Button size="sm" onClick={handleAcceptRequest} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="animate-spin" /> : 'Accept Request'}
                 </Button>;
            }
        case 'not_connected':
            return <Button size="sm" onClick={handleSendRequest} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="animate-spin mr-2"/> : <UserPlus className="mr-2"/>}
                    Add Friend
                </Button>;
        case 'self':
            return null; // Don't show button on your own profile
        default:
            return null;
    }
  }
  
  const derivedStatus = getDerivedStatus(profile);

  if (loading) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-1 h-[500px]" />
            <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-[200px]" />
                <Skeleton className="h-[300px]" />
            </div>
        </div>
    );
  }
  
  if (!profile) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-xl font-headline">Operator not found in the Aetherweave network.</p>
        </div>
      )
  }
  
  const isOwnProfile = currentUser?.uid === profile.id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Profile Card */}
      <div className="lg:col-span-1 space-y-8">
        <Card className="text-center">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative w-32 h-32">
              <Avatar className="w-32 h-32 border-4 border-primary neon-glow-primary">
                <AvatarImage src={profile.photoURL ?? ''} />
                <AvatarFallback className="text-4xl">
                  {profile.displayName?.charAt(0) || profile.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
               <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <div className={cn(
                            "absolute top-0 right-0 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center",
                            derivedStatus.color
                         )}>
                            {derivedStatus.isOnline && <div className={cn("w-2 h-2 rounded-full bg-background/50", derivedStatus.isOnline ? 'bg-green-400 animate-pulse' : '')}></div>}
                         </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{derivedStatus.label}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <h2 className="mt-4 text-2xl font-headline text-glow">{profile.displayName}</h2>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            <p className="text-sm font-bold text-secondary mt-1">{profile.gaming?.username ? `@${profile.gaming.username}` : ''}</p>
            <p className="text-xs text-green-400 font-mono mt-1">{profile.gaming?.status || ''}</p>
            
            <div className="flex gap-2 mt-4">
                 {renderConnectionButton()}
                 <Button size="sm" variant="outline" asChild disabled={isOwnProfile}>
                    <Link href={`/chat?contactId=${profile.id}`}>
                        <MessageSquare className="mr-2"/> Message
                    </Link>
                 </Button>
            </div>
           
            <p className="mt-4 text-muted-foreground text-sm">{profile.bio || "No bio set."}</p>

             <div className="w-full space-y-4 mt-6">
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>XP</span>
                        <span>{profile.xp ?? 0} / {xpForNextLevel}</span>
                    </div>
                    <Progress value={xpPercentage} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="font-bold text-lg text-glow">{profile.level ?? 1}</p>
                        <p className="text-xs text-muted-foreground">Level</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg text-glow">{'N/A'}</p>
                        <p className="text-xs text-muted-foreground">Reputation</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg text-glow">{profile.trustScore ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Trust Level</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-4">
              <Calendar className="w-3 h-3 mr-1.5"/>
              Operator since {accountCreationDate}
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <a href={profile.socials?.github || '#'} target="_blank" rel="noopener noreferrer"><Github className="w-6 h-6 text-muted-foreground hover:text-primary"/></a>
              <a href={profile.socials?.twitter || '#'} target="_blank" rel="noopener noreferrer"><Twitter className="w-6 h-6 text-muted-foreground hover:text-primary"/></a>
              <a href={profile.socials?.linkedin || '#'} target="_blank" rel="noopener noreferrer"><Linkedin className="w-6 h-6 text-muted-foreground hover:text-primary"/></a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Content */}
      <div className="lg:col-span-2 space-y-8">
        <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="gaming">Gaming</TabsTrigger>
                <TabsTrigger value="badges">Achievements</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
                 <Card>
                  <CardHeader>
                    <CardTitle>User Activity & Stats</CardTitle>
                    <CardDescription>
                      A summary of this operator's engagement across the platform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-input/50">
                            <MessageSquare className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-2xl font-bold text-glow">{profile.messagesSent ?? 0}</p>
                                <p className="text-sm text-muted-foreground">Messages</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-4 rounded-lg bg-input/50">
                            <StickyNote className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-2xl font-bold text-glow">{profile.notesCreated ?? 0}</p>
                                <p className="text-sm text-muted-foreground">Notes</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-4 rounded-lg bg-input/50">
                            <FileUp className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-2xl font-bold text-glow">{profile.filesUploaded ?? 0}</p>
                                <p className="text-sm text-muted-foreground">Uploads</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-input/50">
                            <Zap className="w-8 h-8 text-secondary"/>
                            <div>
                                <p className="text-2xl font-bold text-glow">{'N/A'}</p>
                                <p className="text-sm text-muted-foreground">Reputation</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-input/50">
                            <Shield className="w-8 h-8 text-secondary"/>
                            <div>
                                <p className="text-2xl font-bold text-glow">{profile.trustScore ?? 0}%</p>
                                <p className="text-sm text-muted-foreground">Trust Level</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-4 rounded-lg bg-input/50">
                            <TrendingUp className="w-8 h-8 text-secondary"/>
                            <div>
                                <p className="text-2xl font-bold text-glow">#--</p>
                                <p className="text-sm text-muted-foreground">Rank</p>
                            </div>
                        </div>
                  </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="gaming">
                 <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Gamepad2 className="text-primary"/> Gaming Stats</CardTitle>
                    <CardDescription>
                      A summary of this operator's gaming activity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-input/50">
                            <Users className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-2xl font-bold text-glow">{0}</p>
                                <p className="text-sm text-muted-foreground">Servers Joined</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-4 rounded-lg bg-input/50">
                            <Mic className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-2xl font-bold text-glow">{0}</p>
                                <p className="text-sm text-muted-foreground">Voice Hours</p>
                            </div>
                        </div>
                  </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="badges">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award className="text-primary"/> Achievement Showcase</CardTitle>
                        <CardDescription>This operator's collection of unlocked achievements.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {achievements.map(badge => {
                            const unlocked = isAchievementUnlocked(badge.id);
                            return (
                                 <TooltipProvider key={badge.id}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                        <div className={cn(
                                                "aspect-square flex flex-col items-center justify-center text-center p-2 rounded-lg border-2 transition-all",
                                                unlocked ? "bg-secondary/20 border-secondary neon-border-secondary" : "bg-muted/50 border-border filter grayscale opacity-60"
                                            )}>
                                                <div className="relative">
                                                    <Hexagon className={cn("w-16 h-16", unlocked ? "text-secondary" : "text-muted-foreground")} fill="currentColor" fillOpacity={0.1}/>
                                                    <badge.icon className={cn("w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", unlocked ? "text-secondary-foreground" : "text-muted-foreground")}/>
                                                    {!unlocked && <Lock className="w-5 h-5 absolute bottom-1 right-1 text-muted-foreground" />}
                                                </div>
                                                <p className={cn("mt-2 text-xs font-semibold", unlocked ? "text-secondary-foreground" : "text-muted-foreground")}>{badge.name}</p>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="max-w-xs">
                                            <p className="font-bold text-base">{badge.name}</p>
                                            <p>{badge.description}</p>
                                            {unlocked ? (
                                                <p className="text-green-400 font-bold mt-1">Unlocked!</p>
                                            ) : (
                                                <p className="text-yellow-400 font-bold mt-1">Locked (Requires Level {badge.level})</p>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )
                        })}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

    