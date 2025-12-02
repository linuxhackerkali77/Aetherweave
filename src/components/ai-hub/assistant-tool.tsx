'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";
import { runAssistantStream, AssistantInput } from '@/ai/flows/assistant-stream-flow';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Message = {
    role: 'user' | 'model';
    content: string;
};

export default function AssistantTool() {
    const { user, profile } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`ai-hub-${user.uid}`);
            if (saved) setMessages(JSON.parse(saved));
        }
    }, [user]);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages: Message[] = [...messages, userMessage];
        setMessages(newMessages);
        if (user) localStorage.setItem(`ai-hub-${user.uid}`, JSON.stringify(newMessages));
        setInput('');
        setIsLoading(true);

        try {
            const assistantInput: AssistantInput = {
                history: messages, // Send history up to the user's new message
                prompt: input,
            };
            
            const stream = await runAssistantStream(assistantInput);
            let modelResponse = '';
            
            // Add a placeholder for the model's message
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of stream) {
                modelResponse += chunk;
                // Update the last message in the array with the new chunk
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = modelResponse;
                    if (user) localStorage.setItem(`ai-hub-${user.uid}`, JSON.stringify(updated));
                    return updated;
                });
                scrollToBottom();
            }

        } catch (error) {
            console.error("Error calling assistant:", error);
            const errorMessage: Message = { role: 'model', content: "Apologies, Operator. I'm experiencing a connection issue with my core logic." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col border rounded-lg bg-background/30 h-[calc(100vh-20rem)]">
            <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                    {messages.length === 0 && (
                         <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-primary/20 border border-primary">
                                <Bot className="w-6 h-6 text-primary"/>
                            </div>
                            <div className="prose prose-invert prose-p:text-foreground p-4 rounded-lg bg-muted/50 border border-border w-full">
                                <p className="font-semibold text-primary pb-1 not-prose">Aether</p>
                                <p>Greetings, Operator. I am Aether, your personal AI assistant. How may I augment your workflow today?</p>
                            </div>
                        </div>
                    )}
                    {messages.map((message, index) => (
                        <div key={index} className={cn("flex items-start gap-4", message.role === 'user' && "justify-end")}>
                            {message.role === 'model' && (
                                <div className="p-2 rounded-full bg-primary/20 border border-primary">
                                    <Bot className="w-6 h-6 text-primary"/>
                                </div>
                            )}
                            <div className={cn(
                                "prose prose-invert prose-p:text-foreground prose-headings:text-primary prose-strong:text-foreground prose-code:text-secondary p-4 rounded-lg border w-auto max-w-xl",
                                message.role === 'model' ? "bg-muted/50 border-border" : "bg-green-500/10 border-green-500/50"
                            )}>
                                <p className={cn("font-semibold pb-1 not-prose", message.role === 'model' ? 'text-primary' : 'text-green-400')}>
                                    {message.role === 'model' ? "Aether" : profile?.username || 'Operator'}
                                </p>
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                {isLoading && message.role === 'model' && index === messages.length -1 && (
                                     <span className="inline-block w-2.5 h-4 bg-primary animate-pulse ml-1"></span>
                                )}
                            </div>
                            {message.role === 'user' && (
                                 <Link href="/profile">
                                    <Avatar className="h-10 w-10 border-2 border-green-500/50 cursor-pointer">
                                        <AvatarImage src={profile?.photoURL ?? userAvatar?.imageUrl} data-ai-hint={userAvatar?.imageHint} />
                                        <AvatarFallback>{profile?.username?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                </Link>
                            )}
                        </div>
                    ))}
                    {isLoading && messages[messages.length-1]?.role !== 'model' && (
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-primary/20 border border-primary">
                                <Bot className="w-6 h-6 text-primary"/>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50 border border-border flex items-center gap-2">
                                <span className="h-2 w-2 bg-primary/80 rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                                <span className="h-2 w-2 bg-primary/80 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                <span className="h-2 w-2 bg-primary/80 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <form onSubmit={handleSendMessage} className="relative p-4 border-t">
                <Input
                    placeholder="Interface with Aether..."
                    className="pr-12 bg-input text-base h-12"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <Button size="icon" type="submit" className="absolute right-2 top-2 h-8 w-8" disabled={isLoading}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
