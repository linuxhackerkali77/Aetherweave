
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Recovery Link Sent',
        description: 'Check your email inbox to reset your passphrase.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className="w-full max-w-md animate-hologram-fade">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-glow">Passphrase Recovery</CardTitle>
          <CardDescription>Initiate secure recovery protocol.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Neural Interface ID (Email)</Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@aether.corp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input"
              />
            </div>
            <Button type="submit" className="w-full cyber-button h-12 text-lg" disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" /> Sending Link...</> : 'Send Recovery Link'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Remembered your passphrase?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Return to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
