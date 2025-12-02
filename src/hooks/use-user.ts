
'use client';

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { doc, onSnapshot, setDoc, serverTimestamp, DocumentData, Timestamp, updateDoc, increment, writeBatch, arrayUnion, runTransaction, collection, addDoc, arrayRemove, getDoc } from 'firebase/firestore';
import { useToast } from './use-toast';
import { Quest, dailyQuests, weeklyQuests, seasonalQuests } from '@/lib/quests';
import { StoreItem } from '@/lib/store-items';
import { isBefore, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { appEventEmitter } from '@/lib/event-emitter';
import { themes } from '@/lib/themes';
import { achievements } from '@/lib/achievements';

// Expanded settings structure
export interface UserSettings {
    cursor?: {
        style?: string;
        lowPerf?: boolean;
    };
    sound?: {
        masterVolume?: number;
        uiVolume?: number;
        notificationVolume?: number;
        enableSounds?: boolean;
    };
    animations?: {
        level?: 'none' | 'basic' | 'full';
    };
    developer?: {
        enableDevTools?: boolean;
    },
    gaming?: {
        performanceMode?: boolean;
    }
}

export interface GamingProfile {
    username?: string;
    status?: 'ONLINE' | 'IN_GAME' | 'AFK' | 'OFFLINE';
    theme?: string;
}

export interface UserProfile {
    id: string;
    username: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    bio?: string;
    status?: string;
    lastSeen?: Timestamp;
    isAnonymous: boolean;
    createdAt: Timestamp;
    xp: number;
    level: number;
    trustScore?: number;
    streak?: number;
    socials?: {
        github?: string;
        twitter?: string;
        linkedin?: string;
    };
    interests?: string[];
    badgesUnlocked: string[];
    questsCompleted: string[];
    questResets: {
        daily: Timestamp;
        weekly: Timestamp;
        seasonal: Timestamp;
    };
    theme?: string;
    inventory: string[];
    settings?: UserSettings;
    gaming?: GamingProfile;
    messagesSent: number;
    notesCreated: number;
    filesUploaded: number;
    friends: number;
    lastBonusClaim?: Timestamp;
}


export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const reloadUser = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  }, [auth]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setAuthChecked(true);
    });
    
    return () => unsubscribe();
  }, [auth]);

  const checkAchievements = useCallback((newProfileData: UserProfile) => {
    if (!newProfileData || !user) return;
  
    const newlyUnlocked = achievements.filter(ach => {
      if (newProfileData.badgesUnlocked?.includes(ach.id)) return false;
      
      switch (ach.id) {
        case 'communicator-1': return newProfileData.messagesSent >= 1;
        case 'communicator-2': return newProfileData.messagesSent >= 100;
        case 'communicator-3': return newProfileData.messagesSent >= 1000;
        case 'archivist-1': return newProfileData.notesCreated >= 1;
        case 'archivist-2': return newProfileData.notesCreated >= 25;
        case 'socialite-1': return newProfileData.friends >= 1;
        case 'socialite-2': return newProfileData.friends >= 5;
        case 'cloud-warrior-1': return newProfileData.filesUploaded >= 1;
        case 'guardian': return (newProfileData.trustScore ?? 0) >= 75;
        case 'overlord': return newProfileData.level >= 50;
        default: return false;
      }
    });
  
    if (newlyUnlocked.length > 0) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const batch = writeBatch(firestore);
      
      newlyUnlocked.forEach(ach => {
        toast({
          title: 'Achievement Unlocked!',
          description: `You've earned the "${ach.name}" badge.`,
        });
        batch.update(userDocRef, { badgesUnlocked: arrayUnion(ach.id) });
      });
  
      batch.commit().catch(e => console.error("Error committing achievement batch:", e));
    }
  }, [toast, user, firestore]);

  // Profile listener effect
  useEffect(() => {
    if (user && authChecked) {
      setLoading(true);
      const userDocRef = doc(firestore, 'users', user.uid);

      const unsubscribeProfile = onSnapshot(userDocRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            const newProfileData = { ...docSnap.data(), id: docSnap.id } as UserProfile;
            setProfile(newProfileData);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, 
        (error) => {
          console.error("Error fetching user profile:", error);
          setLoading(false);
        }
      );
      
      return () => {
        unsubscribeProfile();
      };

    } else if (!user && authChecked) {
      setProfile(null);
      setLoading(false);
    }
  }, [user, firestore, authChecked]);
  
  // Presence management effect - ISOLATED from profile listening
  useEffect(() => {
    if (user && authChecked) {
      const userDocRef = doc(firestore, 'users', user.uid);

      // Initial update
      updateDoc(userDocRef, { lastSeen: serverTimestamp(), status: 'Online' }).catch(e => console.error("Initial presence update failed:", e));
      
      // Periodic update
      const presenceInterval = setInterval(() => {
        if(document.visibilityState === 'visible') {
            updateDoc(userDocRef, { lastSeen: serverTimestamp() }).catch(e => console.error("Periodic presence update failed:", e));
        }
      }, 60 * 1000); // Update every minute

      return () => clearInterval(presenceInterval);
    }
  }, [user, firestore, authChecked]);
  
  const incrementStat = useCallback(async (stat: keyof UserProfile, value: number) => {
    if (!user || !firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw "User document does not exist!";
            }
            const currentStatValue = userDoc.data()[stat] || 0;
            transaction.update(userDocRef, { [stat]: currentStatValue + value });
        });
        
        // Fetch the latest profile data AFTER the transaction to check achievements
        const updatedDoc = await getDoc(userDocRef);
        if (updatedDoc.exists()) {
            checkAchievements(updatedDoc.data() as UserProfile);
        }
    } catch (e) {
        console.error("Error incrementing stat:", e);
    }
  }, [firestore, user, checkAchievements]);

  const updateStatus = useCallback(async (status: string) => {
    if (!user || !firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    await updateDoc(userDocRef, { status: status, lastSeen: serverTimestamp() });
    toast({ title: 'Status Updated', description: `Your status has been set to ${status}.`})
  }, [firestore, user, toast]);

  const updateProfileSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Not authenticated.' });
      return;
    }
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
      await setDoc(userDocRef, { settings: newSettings }, { merge: true });
      // Optimistically update local state
      if (profile) {
        setProfile({
            ...profile,
            settings: {
                ...profile.settings,
                ...newSettings
            }
        });
      }
      toast({ title: 'Settings Saved', description: 'Your preferences have been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    }
  }, [user, firestore, toast, profile]);


  const addXp = useCallback(async (amount: number) => {
      if (!user || !firestore) return;
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { xp: increment(amount) });
      appEventEmitter.emit('xp:earned');
  }, [firestore, user]);

 const claimQuestReward = useCallback(async (quest: Quest) => {
    if (!user || !profile || !firestore) {
      toast({ variant: 'destructive', title: 'Authentication Error' });
      return;
    }
    if (profile.questsCompleted?.includes(quest.id)) {
        console.warn("Quest already claimed.");
        return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);

    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw "User document does not exist!";
            }

            let currentXp = userDoc.data().xp || 0;
            let currentLevel = userDoc.data().level || 1;
            
            // Add quest XP
            currentXp += quest.xp;

            // Check for level up
            let xpForNextLevel = currentLevel * 1000 + 1000;
            while (currentXp >= xpForNextLevel) {
                currentXp -= xpForNextLevel;
                currentLevel += 1;
                xpForNextLevel = currentLevel * 1000 + 1000; // Calculate XP for the new level
                toast({
                    title: "Level Up!",
                    description: `Congratulations, you've reached level ${currentLevel}!`
                });
            }

            // Prepare update data
            const updateData: any = {
                xp: currentXp,
                level: currentLevel,
                questsCompleted: arrayUnion(quest.id),
            };

            if (quest.badgeReward) {
                updateData.badgesUnlocked = arrayUnion(quest.badgeReward);
            }

            transaction.update(userDocRef, updateData);
        });
        appEventEmitter.emit('xp:earned');
    } catch (error) {
        console.error("Failed to claim quest reward:", error);
        toast({
            variant: 'destructive',
            title: 'Claim Failed',
            description: 'Could not sync with server. Please try again.'
        });
    }
}, [user, profile, firestore, toast]);
  
   const purchaseItem = useCallback(async (item: StoreItem) => {
    if (!user || !profile || !firestore) throw new Error("User not authenticated.");
    if (profile.xp < item.price) throw new Error("Not enough XP.");
    if (profile.inventory?.includes(item.id)) throw new Error("Item already owned.");

    const userDocRef = doc(firestore, 'users', user.uid);
    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw "User document does not exist!";

        const currentXp = userDoc.data().xp || 0;
        if (currentXp < item.price) throw "Not enough XP.";

        transaction.update(userDocRef, {
          xp: increment(-item.price),
          inventory: arrayUnion(item.id)
        });
      });

      if (item.unlocksBadge) {
         await updateDoc(userDocRef, {
            badgesUnlocked: arrayUnion(item.unlocksBadge)
        });
      }
      
    } catch (e) {
      console.error("Purchase transaction failed: ", e);
      throw e;
    }
  }, [user, profile, firestore]);
  
  const checkAndResetQuests = useCallback(async () => {
    if (!user || !profile || !firestore) return;
    
    const now = new Date();
    const userDocRef = doc(firestore, 'users', user.uid);
    const questResets = profile.questResets;
    
    // Use regular date-fns functions instead of UTC versions
    const startOfToday = startOfDay(now);
    const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const startOfThisMonth = startOfMonth(now);

    const updates: any = {};
    let questsToRemove: string[] = [];
    
    if (!questResets?.daily || isBefore(questResets.daily.toDate(), startOfToday)) {
        updates['questResets.daily'] = serverTimestamp();
        questsToRemove = [...questsToRemove, ...dailyQuests.map(q => q.id)];
    }
    
    if (!questResets?.weekly || isBefore(questResets.weekly.toDate(), startOfThisWeek)) {
        updates['questResets.weekly'] = serverTimestamp();
        questsToRemove = [...questsToRemove, ...weeklyQuests.map(q => q.id)];
    }
    
    if (!questResets?.seasonal || isBefore(questResets.seasonal.toDate(), startOfThisMonth)) {
        updates['questResets.seasonal'] = serverTimestamp();
        questsToRemove = [...questsToRemove, ...seasonalQuests.map(q => q.id)];
    }

    if (Object.keys(updates).length > 0) {
        if (questsToRemove.length > 0) {
            updates.questsCompleted = arrayRemove(...questsToRemove);
        }
        await updateDoc(userDocRef, updates);
        toast({ title: 'Quests Reset', description: 'Your daily/weekly/seasonal quests have been reset.'});
    }

  }, [user, profile, firestore, toast]);

  const setProfileCallback = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
      await updateDoc(userDocRef, updates);
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }, [user, firestore, profile]);

  return { 
    user, 
    profile, 
    loading: loading || !authChecked,
    reloadUser, 
    incrementStat, 
    updateStatus,
    updateProfileSettings,
    addXp, 
    claimQuestReward, 
    purchaseItem, 
    checkAndResetQuests, 
    setProfile: setProfileCallback,
    updateProfile
  };
}
