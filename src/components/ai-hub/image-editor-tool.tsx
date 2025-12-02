'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateImageFromImage, GenerateImageFromImageInput } from '@/ai/flows/generate-image-from-image-flow';
import Image from 'next/image';
import { Loader2, Wand2, ImageIcon, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ImageEditorTool() {
    const [prompt, setPrompt] = useState('');
    const [baseImage, setBaseImage] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please upload an image file.',
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setBaseImage(e.target?.result as string);
            setGeneratedImageUrl(null); // Clear previous result when new image is uploaded
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0] || null;
        handleFileChange(file);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast({ variant: 'destructive', title: 'Prompt is empty', description: 'Please enter a prompt to edit the image.' });
            return;
        }
        if (!baseImage) {
            toast({ variant: 'destructive', title: 'No image selected', description: 'Please upload a base image to edit.' });
            return;
        }

        setIsLoading(true);
        setGeneratedImageUrl(null);

        try {
            const input: GenerateImageFromImageInput = { prompt, baseImage };
            const result = await generateImageFromImage(input);
            setGeneratedImageUrl(result.imageUrl);
        } catch (error) {
            console.error('Image editing failed:', error);
            toast({ variant: 'destructive', title: 'Editing Failed', description: 'Could not edit image. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full border rounded-lg bg-background/30 p-4 gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Base Image */}
                <div
                    className={cn("flex flex-col gap-2 transition-all", dragging && "neon-border-primary")}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <label className="text-sm font-medium text-muted-foreground">Base Image</label>
                    <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border overflow-hidden relative">
                        {baseImage ? (
                            <Image src={baseImage} alt="Base image" layout="fill" className="object-contain" />
                        ) : (
                            <div className="text-center text-muted-foreground p-8 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="font-headline text-xl">Upload Image</h3>
                                <p>Click or drag & drop an image to edit.</p>
                            </div>
                        )}
                         {dragging && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none rounded-lg">
                                <div className="text-center p-8 border-2 border-dashed border-primary rounded-lg">
                                <UploadCloud className="w-16 h-16 text-primary mx-auto animate-pulse" />
                                <p className="mt-4 text-xl font-headline text-glow">Drop Image Here</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        accept="image/*"
                        className="hidden"
                    />
                     <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Choose File
                    </Button>
                </div>
                {/* Generated Image */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Generated Image</label>
                    <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border overflow-hidden">
                        {isLoading && (
                            <div className="flex flex-col items-center gap-4 text-primary">
                                <Loader2 className="w-12 h-12 animate-spin" />
                                <p className="font-headline text-glow">Rendering modifications...</p>
                            </div>
                        )}
                        {!isLoading && generatedImageUrl && (
                            <Image src={generatedImageUrl} alt={prompt} layout="fill" className="object-contain" />
                        )}
                        {!isLoading && !generatedImageUrl && (
                            <div className="text-center text-muted-foreground p-8">
                                <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                                <h3 className="font-headline text-xl">Output Canvas</h3>
                                <p>Your edited image will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Input
                    placeholder="Enter an editing prompt... (e.g., 'add a futuristic neon frame', 'turn this into a cyberpunk character')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-input text-base h-12"
                    disabled={isLoading}
                />
                <Button onClick={handleGenerate} disabled={isLoading || !baseImage} className="w-full cyber-button h-12 text-lg">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-5 w-5" />
                            Apply AI Edit
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
