'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { UserProfile } from '@/hooks/use-user';
import { useState as useLoginState } from 'react';
import { useRouter as useLoginRouter } from 'next/navigation';

function LoginLink() {
  const [loading, setLoading] = useLoginState(false);
  const router = useLoginRouter();

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push('/login');
  };

  return (
    <span 
      onClick={handleLoginClick}
      className="text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
    >
      {loading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading...
        </>
      ) : (
        'Login'
      )}
    </span>
  );
}


export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'Passphrases do not match.',
      });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 1. Update Firebase Auth Profile
      await updateProfile(user, { displayName });

      // 2. Create user document in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const now = serverTimestamp();
      
      const userProfileData = {
        id: user.uid,
        username: username.toLowerCase(),
        email: user.email || '',
        displayName: displayName,
        photoURL: user.photoURL || '',
        bio: 'New operator in the matrix.',
        status: 'Online',
        isAnonymous: false,
        createdAt: now,
        xp: 100,
        level: 1,
        trustScore: 50,
        streak: 1,
        badgesUnlocked: ['pioneer'],
        inventory: [],
        questsCompleted: [],
        questResets: {
            daily: now,
            weekly: now,
            seasonal: now,
        },
        messagesSent: 0,
        notesCreated: 0,
        filesUploaded: 0,
        friends: 0,
      };
      
      await setDoc(userDocRef, userProfileData);
      
      toast({
          title: 'Registration Successful',
          description: 'Aetherweave connection established. Redirecting...',
      });
      router.push('/');


    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'An unknown error occurred.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This Neural Interface ID is already registered.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Passphrase is too weak. Must be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid Neural Interface ID format.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Could not create user profile. Please try again.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: errorMessage,
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className="w-full max-w-md animate-hologram-fade">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-glow">Create Your Operator ID</CardTitle>
          <CardDescription>Register for system access to Aetherweave.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your unique handle, e.g. 'cypher'"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-input"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="The name others will see, e.g. 'Cypher'"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Neural Interface ID (Email)</Label>
              <Input
                id="email"
                type="email"
                placeholder="new-operator@aether.corp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passphrase</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Passphrase</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-input"
              />
            </div>
            <Button type="submit" className="w-full cyber-button h-12 text-lg" disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" /> Registering...</> : 'Register'}
            </Button>          
          </form>
           <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an access key?{' '}
            <LoginLink />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
