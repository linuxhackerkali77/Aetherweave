
'use client';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Smile, Paperclip, Loader2, X, Image as ImageIcon, Video, File as FileIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker from './EmojiPicker';
import { Message, aetherBotContact, Contact } from '@/types/chat';
import { useUser } from '@/hooks/use-user';
import { useFirestore } from '@/firebase/provider';
import { runAssistantStream } from '@/ai/flows/assistant-stream-flow';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useAuth } from '@/firebase/provider';
import { appEventEmitter } from '@/lib/event-emitter';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadToCloudflare } from '@/lib/cloudflare-r2';
import { Progress } from '../ui/progress';

interface MessageInputProps {
    chatId: string | null;
    selectedContact: Contact | null;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    replyingTo: Message | null;
    setReplyingTo: (message: Message | null) => void;
    forwardingMessage: Message | null;
    setForwardingMessage: (message: Message | null) => void;
}

const UploadPreview = ({ file, onCancel, onSend }: { file: File, onCancel: () => void, onSend: () => void }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [file]);

    const getFileIcon = () => {
        if (file.type.startsWith('video/')) return <Video className="w-10 h-10 text-primary" />;
        return <FileIcon className="w-10 h-10 text-muted-foreground" />;
    };

    return (
        <motion.div
            className="p-2 mb-2 bg-muted/80 rounded-t-md text-sm border-b border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
        >
            <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-background rounded-md flex items-center justify-center overflow-hidden">
                    {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : getFileIcon()}
                </div>
                <div className="flex-1">
                    <p className="font-semibold truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}><X size={16} /></Button>
                <Button size="sm" onClick={onSend}><Send size={16} className="mr-2"/> Send</Button>
            </div>
        </motion.div>
    );
}


export default function MessageInput({ chatId, selectedContact, messages, setMessages, replyingTo, setReplyingTo, forwardingMessage, setForwardingMessage }: MessageInputProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const { user, profile, incrementStat } = useUser();
    const firestore = useFirestore();
    const auth = useAuth();

    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (replyingTo) {
            inputRef.current?.focus();
        }
    }, [replyingTo]);

    useEffect(() => {
        const handleForwardMessage = (message: Message) => {
            setForwardingMessage(message);
        };
        appEventEmitter.on('chat:forward-message', handleForwardMessage);
        return () => {
            appEventEmitter.off('chat:forward-message', handleForwardMessage);
        };
    }, [setForwardingMessage]);
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileToUpload(file);
        }
    };

    const handleSend = async (text: string, media?: { url: string; type: string }) => {
        if (!user || !chatId || !profile) return;
        
        const replyContext = replyingTo ? {
            replyTo: replyingTo.id,
            replyContent: replyingTo.content,
            replySender: replyingTo.senderName,
        } : {};

        const forwardedContent = forwardingMessage ? `📤 Forwarded: ${forwardingMessage.content}` : text;
        const finalContent = forwardingMessage ? forwardedContent : text;

        setInput('');
        setReplyingTo(null);
        setForwardingMessage(null);
        setFileToUpload(null);

        // Handle AI bot chat
        if (chatId === 'aether-bot') {
            setIsLoading(true);
            const userMessage: Message = {
                id: `temp-${Date.now()}`,
                senderId: user.uid,
                senderName: profile.displayName || 'You',
                senderAvatar: profile.photoURL || '',
                content: finalContent,
                timestamp: null,
                role: 'user',
                status: 'sent',
                participants: [user.uid, 'aether-bot']
            };
            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);
            localStorage.setItem(`aether-bot-${user.uid}`, JSON.stringify(updatedMessages));

            try {
                const history = messages.map(m => ({ role: m.role || 'user', content: m.content }));
                const stream = await runAssistantStream({ history, prompt: finalContent });
                
                let botResponse = '';
                const botMessage: Message = {
                    id: `bot-${Date.now()}`,
                    senderId: 'aether-bot',
                    senderName: 'Aether',
                    senderAvatar: '',
                    content: '',
                    timestamp: null,
                    role: 'model',
                    status: 'sent',
                    participants: [user.uid, 'aether-bot']
                };
                setMessages(prev => {
                    const newMessages = [...prev, botMessage];
                    localStorage.setItem(`aether-bot-${user.uid}`, JSON.stringify(newMessages));
                    return newMessages;
                });

                for await (const chunk of stream) {
                    botResponse += chunk;
                    setMessages(prev => {
                        const newMessages = prev.map(m => m.id === botMessage.id ? { ...m, content: botResponse } : m);
                        localStorage.setItem(`aether-bot-${user.uid}`, JSON.stringify(newMessages));
                        return newMessages;
                    });
                }
                await incrementStat('messagesSent', 1);
            } catch (error) {
                console.error('AI error:', error);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (!firestore) return;
        
        const messagesCollection = collection(firestore, 'chats', chatId, 'messages');
        const participants = [user.uid, selectedContact?.id].filter((id): id is string => !!id);

        const messageData = {
            senderId: user.uid,
            senderName: profile.displayName || profile.email || 'Unknown',
            senderAvatar: profile.photoURL || null,
            content: finalContent,
            timestamp: serverTimestamp(),
            status: 'sent' as const,
            participants: participants,
            ...(media && { mediaUrl: media.url, mediaType: media.type }),
            ...replyContext,
        };

        try {
            await addDoc(messagesCollection, messageData);
            const chatRef = doc(firestore, 'chats', chatId);
            await updateDoc(chatRef, {
                lastMessage: media ? (media.type.startsWith('image') ? '📷 Image' : '📎 Attachment') : text,
                lastMessageTimestamp: serverTimestamp(),
            });
            if (!media) {
                await incrementStat('messagesSent', 1);
            } else {
                 await incrementStat('filesUploaded', 1);
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            const permissionError = new FirestorePermissionError({
                path: messagesCollection.path,
                operation: 'create',
                requestResourceData: messageData,
            }, auth);
            errorEmitter.emit('permission-error', permissionError);
        }
    };
    
    const handleUploadAndSend = async () => {
        if (!fileToUpload || !chatId) return;
        setIsLoading(true);
        setUploadProgress(50);

        try {
            const downloadURL = await uploadToCloudflare(fileToUpload);
            setUploadProgress(100);
            await handleSend(input, { url: downloadURL, type: fileToUpload.type });
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsLoading(false);
            setUploadProgress(null);
            setFileToUpload(null);
        }
    }
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fileToUpload) {
            handleUploadAndSend();
        } else if (input.trim()) {
            handleSend(input);
        }
    }

    const handleEmojiSelect = (emoji: string) => {
        setInput(prev => prev + emoji);
        inputRef.current?.focus();
    }

    return (
        <div className="p-4 border-t">
            <AnimatePresence>
                {fileToUpload && !isLoading && (
                    <UploadPreview
                        file={fileToUpload}
                        onCancel={() => setFileToUpload(null)}
                        onSend={handleUploadAndSend}
                    />
                )}
                {isLoading && uploadProgress !== null && (
                    <div className="p-2 mb-2">
                        <p className="text-xs text-center text-muted-foreground mb-2">Uploading...</p>
                        <Progress value={uploadProgress} className="h-2" />
                    </div>
                )}
                {replyingTo && (
                    <motion.div 
                        className="p-2 mb-2 bg-muted/80 rounded-t-md text-sm border-b border-border"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-muted-foreground">Replying to <span className="font-bold text-primary">{replyingTo.senderName}</span></p>
                                <p className="text-foreground truncate max-w-sm">{replyingTo.content}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                                <X size={16} />
                            </Button>
                        </div>
                    </motion.div>
                )}
                {forwardingMessage && (
                    <motion.div 
                        className="p-2 mb-2 bg-muted/80 rounded-t-md text-sm border-b border-border"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-muted-foreground">Forwarding message from <span className="font-bold text-primary">{forwardingMessage.senderName}</span></p>
                                <p className="text-foreground truncate max-w-sm">{forwardingMessage.content}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setForwardingMessage(null)}>
                                <X size={16} />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <form onSubmit={handleFormSubmit} className="relative">
                 <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    className="pr-24 bg-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" type="button">
                                <Smile className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" align="end" className="p-0">
                            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                        </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon" type="button" onClick={() => alert('File uploads temporarily disabled')} disabled={true}><Paperclip className="w-5 h-5 text-muted-foreground opacity-50" /></Button>
                    <Button size="icon" type="submit" className="ml-2 w-8 h-8" disabled={isLoading || (!input.trim() && !fileToUpload)}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            </form>
        </div>
    );
}
