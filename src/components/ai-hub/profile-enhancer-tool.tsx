'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { enhanceProfile, EnhanceProfileInput, EnhanceProfileOutput } from '@/ai/flows/enhance-profile-flow';
import { Loader2, Sparkles, User, Lightbulb, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export default function ProfileEnhancerTool() {
    const [interests, setInterests] = useState('');
    const [result, setResult] = useState<EnhanceProfileOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!interests.trim()) {
            toast({
                variant: 'destructive',
                title: 'Input is empty',
                description: 'Please enter some interests to generate a profile.',
            });
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const input: EnhanceProfileInput = { interests };
            const response = await enhanceProfile(input);
            setResult(response);
        } catch (error) {
            console.error('Profile enhancement failed:', error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Could not enhance profile. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full border rounded-lg bg-background/30 p-4 gap-4">
            <div className="flex-1 flex flex-col items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border overflow-auto p-6">
                {isLoading && (
                    <div className="flex flex-col items-center gap-4 text-primary">
                        <Loader2 className="w-12 h-12 animate-spin" />
                        <p className="font-headline text-glow">Analyzing personality matrix...</p>
                    </div>
                )}
                {!isLoading && result && (
                    <div className="w-full space-y-6 animate-in fade-in-50">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><User className="text-primary"/> Suggested Bio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg">{result.bio}</p>
                            </CardContent>
                        </Card>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Aura</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="secondary" className="text-2xl font-bold tracking-widest uppercase bg-secondary/20 border-2 border-secondary neon-border-secondary">{result.auraPersonality}</Badge>
                                </CardContent>
                            </Card>
                             <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Palette className="text-primary"/> Theme</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xl font-bold text-glow">{result.suggestedTheme}</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary"/> Suggested Interests</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {result.suggestedInterests.map(interest => (
                                    <Badge key={interest} variant="outline">{interest}</Badge>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
                {!isLoading && !result && (
                     <div className="text-center text-muted-foreground p-8">
                        <Sparkles className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="font-headline text-xl">AI Profile Enhancer</h3>
                        <p>Enter a few interests below and let the AI craft a unique cyberpunk identity for you.</p>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <Input
                    placeholder="Describe your interests... (e.g., 'hacking, synth music, classic anime')"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="bg-input text-base h-12"
                    disabled={isLoading}
                />
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full cyber-button h-12 text-lg">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Enhance Profile
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
