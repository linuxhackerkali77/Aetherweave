'use client';
import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Globe, ArrowLeft, UploadCloud, Link as LinkIcon, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useSpaces } from '@/hooks/use-spaces';
import { cn } from '@/lib/utils';

type View = 'initial' | 'create' | 'join';
type CreateStep = 1 | 2;

export default function CreateOrJoinSpaceModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
  const [view, setView] = useState<View>('initial');
  const [createStep, setCreateStep] = useState<CreateStep>(1);
  const [serverName, setServerName] = useState('');
  const [serverIcon, setServerIcon] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { createSpace, joinSpaceByInvite } = useSpaces();

  const handleBack = () => {
    if (createStep === 2) {
      setCreateStep(1);
    } else {
      setView('initial');
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 100 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please select an image under 100KB.'
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setServerIcon(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid file',
            description: 'Please select an image file.'
        })
    }
  };

  const handleCreateServer = async () => {
    if (!serverName) {
        toast({ variant: 'destructive', title: 'Space name is required.' });
        return;
    }
    setIsLoading(true);
    try {
      const result = await createSpace(serverName, serverIcon || undefined);
      if (result.success) {
        toast({ title: 'Space Created!', description: `The space "${serverName}" is now online.` });
        setServerName('');
        setServerIcon(null);
        setView('initial');
        onOpenChange(false);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to create space' });
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleJoinServer = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      toast({ variant: 'destructive', title: 'Invalid Invite Code', description: "Please enter a valid invite code (e.g., ABC123)." });
      return;
    }
    setIsLoading(true);
    try {
      const result = await joinSpaceByInvite(code);
      if (result.success) {
        toast({ title: 'Joined Space!', description: `Welcome to ${result.spaceName}!` });
        setInviteCode('');
        setView('initial');
        onOpenChange(false);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to join space' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const renderContent = () => {
    switch (view) {
      case 'create':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {createStep === 2 && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleBack}><ArrowLeft size={16}/></Button>}
                Customize Your Space
              </DialogTitle>
              <DialogDescription>
                Give your space a personality with a name and an icon. You can always change it later.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6 text-center">
                 <input type="file" accept="image/*" ref={iconInputRef} onChange={handleIconUpload} className="hidden" />
                 <Avatar 
                    className="w-24 h-24 mx-auto cursor-pointer border-4 border-dashed border-primary/50 hover:border-primary transition-all"
                    onClick={() => iconInputRef.current?.click()}
                >
                    <AvatarImage src={serverIcon ?? undefined} className="object-cover" />
                    <AvatarFallback className="bg-transparent">
                        <UploadCloud size={32} className="text-primary"/>
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-left">
                    <Label htmlFor="server-name">SPACE NAME</Label>
                    <Input id="server-name" value={serverName} onChange={(e) => setServerName(e.target.value)} placeholder="My Awesome Space" />
                </div>
            </div>
             <DialogFooter>
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button onClick={handleCreateServer} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2"/> : null}
                Create
              </Button>
            </DialogFooter>
          </>
        );
      case 'join':
        return (
            <>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleBack}><ArrowLeft size={16}/></Button>
                        Join a Space
                    </DialogTitle>
                    <DialogDescription>
                        Enter an invite code below to join an existing space.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="invite-code">INVITE CODE</Label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input 
                          id="invite-code" 
                          value={inviteCode} 
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())} 
                          placeholder="ABC123" 
                          className="pl-9 uppercase tracking-widest font-mono"
                          maxLength={8}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Ask your friend for their space&apos;s invite code</p>
                </div>
                <DialogFooter>
                     <Button className="w-full" onClick={handleJoinServer} disabled={isLoading}>
                       {isLoading ? <Loader2 className="animate-spin mr-2"/> : null}
                       Join Space
                    </Button>
                </DialogFooter>
            </>
        )
      case 'initial':
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create or Join a Space</DialogTitle>
              <DialogDescription>
                Create a new hub for your friends or community, or join an existing one.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <Card onClick={() => setView('create')} className="hover:neon-border-primary cursor-pointer transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">Create My Own <Users /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Create a new space for you and your friends.</p>
                    </CardContent>
                </Card>
                 <Card onClick={() => setView('join')} className="hover:neon-border-primary cursor-pointer transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">Join a Space <Globe /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Join an existing space with an invite code.</p>
                    </CardContent>
                </Card>
            </div>
          </>
        );
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-card" onInteractOutside={(e) => e.preventDefault()}>
        <AnimatePresence mode="wait">
            <motion.div
                key={view + createStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
