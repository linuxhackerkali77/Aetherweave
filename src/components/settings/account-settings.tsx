
'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile, useUser } from '@/hooks/use-user';
import { UploadCloud, Github, Twitter, Linkedin, Loader2, Check, Lock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStorage } from '@/hooks/use-storage';
import { updateProfile as updateAuthProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { useFirestore } from '@/firebase/provider';
import { useAuth } from '@/firebase/provider';

export default function AccountSettings() {
  const { user, profile, loading, reloadUser, setProfile } = useUser();
  const { toast } = useToast();
  const { uploadFile } = useStorage();
  const firestore = useFirestore();
  const auth = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [socials, setSocials] = useState<{ github?: string; twitter?: string; linkedin?: string }>({ github: '', twitter: '', linkedin: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setSocials(profile.socials || { github: '', twitter: '', linkedin: '' });
    } else if (user) {
        setDisplayName(user.displayName || '');
    }
  }, [profile, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }
      
      const { downloadURL } = await response.json();
      
      // Update local state and reload user data
      if (profile) {
        setProfile({ ...profile, photoURL: downloadURL });
      }
      await reloadUser();

      toast({ title: 'Avatar updated successfully!' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
    } finally {
      setIsUploading(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleProfileSave = async () => {
      if(!user || !profile) return;
      setIsSaving(true);
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const profileData: Partial<UserProfile> = {
            displayName,
            username: username.toLowerCase(),
            bio,
            socials,
        };
        await setDoc(userDocRef, profileData, { merge: true });

        if (displayName !== user.displayName && auth.currentUser) {
             await updateAuthProfile(auth.currentUser, { displayName });
        }
        
        // Optimistically update local profile
        setProfile({ ...profile, ...profileData });

        toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
      } catch (error: any) {
         toast({ variant: 'destructive', title: 'Update failed', description: error.message });
      } finally {
        setIsSaving(false);
      }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    try {
        await sendPasswordResetEmail(auth, user.email);
        toast({
            title: 'Password Reset Email Sent',
            description: `A recovery link has been sent to ${user.email}.`
        });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Request failed', description: error.message });
    } finally {
        setIsResetting(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>
            This information will be displayed on your public profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-primary/50">
                        <AvatarImage src={profile?.photoURL ?? user?.photoURL ?? ''} />
                        <AvatarFallback className="text-3xl">
                            {displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : <UploadCloud className="w-4 h-4"/>}
                    </Button>
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" />
                </div>
                <div className="flex-1 space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={e => setUsername(e.target.value)} className="bg-input" disabled />
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3"/>Cannot be changed.</p>
                    <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF, WebP (max 5MB)</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-input" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ''} className="bg-input" disabled />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} className="bg-input" placeholder="Tell everyone a little about yourself..."/>
            </div>
            
            <div className="space-y-4">
                <Label>Social Links</Label>
                <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={socials.github || ''} onChange={e => setSocials({...socials, github: e.target.value})} placeholder="https://github.com/your-username" className="bg-input pl-10"/>
                </div>
                <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={socials.twitter || ''} onChange={e => setSocials({...socials, twitter: e.target.value})} placeholder="https://twitter.com/your-username" className="bg-input pl-10"/>
                </div>
                <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={socials.linkedin || ''} onChange={e => setSocials({...socials, linkedin: e.target.value})} placeholder="https://linkedin.com/in/your-username" className="bg-input pl-10"/>
                </div>
            </div>
          
            <Button onClick={handleProfileSave} disabled={isSaving} className="cyber-button">
                {isSaving ? <><Loader2 className="animate-spin mr-2" /> Saving...</> : <><Check className="mr-2"/>Save Changes</>}
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4 bg-input/50">
                <div>
                    <Label>Password</Label>
                    <p className="text-sm text-muted-foreground">For security, you can reset your password via email.</p>
                </div>
                <Button variant="outline" onClick={handlePasswordReset} disabled={isResetting}>
                {isResetting ? <><Loader2 className="animate-spin mr-2" /> Sending...</> : <><Lock className="mr-2"/> Reset Password</>}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
