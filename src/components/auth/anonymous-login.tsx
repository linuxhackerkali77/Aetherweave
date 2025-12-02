'use client';
import { signInAnonymously } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function AnonymousLogin() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
      toast({
        title: 'Anonymous Access Granted',
        description: 'Entering as guest operator...',
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Anonymous login failed.',
      });
    }
  };

  return (
    <Button 
      onClick={handleAnonymousLogin}
      variant="outline" 
      className="w-full"
    >
      Enter as Guest Operator
    </Button>
  );
}