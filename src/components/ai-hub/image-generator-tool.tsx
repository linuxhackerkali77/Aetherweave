'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateImage, GenerateImageInput } from '@/ai/flows/generate-image-flow';
import Image from 'next/image';
import { Loader2, Wand2, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImageGeneratorTool() {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'Prompt is empty',
                description: 'Please enter a prompt to generate an image.',
            });
            return;
        }
        setIsLoading(true);
        setImageUrl('');
        try {
            const input: GenerateImageInput = { prompt };
            const result = await generateImage(input);
            setImageUrl(result.imageUrl);
        } catch (error) {
            console.error('Image generation failed:', error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Could not generate image. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full border rounded-lg bg-background/30 p-4 gap-4">
            <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border overflow-hidden">
                {isLoading && (
                    <div className="flex flex-col items-center gap-4 text-primary">
                        <Loader2 className="w-12 h-12 animate-spin" />
                        <p className="font-headline text-glow">Synthesizing visual data...</p>
                    </div>
                )}
                {!isLoading && imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={prompt}
                        width={512}
                        height={512}
                        className="object-contain w-full h-full"
                    />
                )}
                {!isLoading && !imageUrl && (
                     <div className="text-center text-muted-foreground p-8">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="font-headline text-xl">Image Canvas</h3>
                        <p>Your generated image will appear here.</p>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <Textarea
                    placeholder="Enter a detailed prompt for the image you want to create... (e.g., 'A cyberpunk city skyline at night, with neon signs and flying vehicles, photorealistic')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[80px] bg-input text-base"
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
                            <Wand2 className="mr-2 h-5 w-5" />
                            Generate Image
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
