
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useState as useSignupState } from 'react';
import { useRouter as useSignupRouter } from 'next/navigation';

function SignupLink() {
  const [loading, setLoading] = useSignupState(false);
  const router = useSignupRouter();

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push('/signup');
  };

  return (
    <span 
      onClick={handleSignupClick}
      className="text-primary hover:underline font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
    >
      {loading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading...
        </>
      ) : (
        'Request Access Key'
      )}
    </span>
  );
}

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/apps';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
        toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: 'Please enter both your email and passphrase.',
        });
        setLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      
      // Success toast
      toast({
        title: 'Access Granted',
        description: 'Neural interface established successfully.',
      });

      // Redirect to the intended page or apps
      router.push(redirect);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Authentication failed. Please check your credentials.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid neural interface ID format.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'No operator found with this ID or incorrect passphrase.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Access temporarily suspended.';
      }

      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <Card className="w-full max-w-md animate-hologram-fade border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <div className="w-6 h-6 bg-primary rounded-sm transform rotate-45"></div>
          </div>
          <CardTitle className="font-headline text-3xl text-glow bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Identity Verification
          </CardTitle>
          <CardDescription className="text-base">
            Authenticate to interface with Aetherweave neural network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Neural Interface ID
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@aether.corp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input/50 border-border focus:border-primary/50 transition-colors h-12"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium">
                  Encrypted Passphrase
                </Label>
                <Link href="/forgot-password" passHref>
                  <span className="text-xs text-primary hover:underline cursor-pointer transition-colors">
                    Passphrase Corrupted?
                  </span>
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input/50 border-border focus:border-primary/50 transition-colors h-12"
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full cyber-button h-12 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Establishing Connection...
                </>
              ) : (
                'Engage Neural Interface'
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-center text-sm text-muted-foreground">
              New to the network?{' '}
              <SignupLink />
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
