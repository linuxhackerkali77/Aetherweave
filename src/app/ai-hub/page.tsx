
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Image as ImageIcon, Languages, Code, Sigma, FileText, Wand2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import AssistantTool from '@/components/ai-hub/assistant-tool';
import ImageGeneratorTool from '@/components/ai-hub/image-generator-tool';
import TranslatorTool from '@/components/ai-hub/translator-tool';
import ProfileEnhancerTool from '@/components/ai-hub/profile-enhancer-tool';
import ImageEditorTool from '@/components/ai-hub/image-editor-tool';

const aiTools = [
  { id: 'assistant', name: 'AI Assistant', icon: Bot, component: AssistantTool, description: 'Your cyberpunk co-pilot for any task.', available: true },
  { id: 'translator', name: 'Translator', icon: Languages, component: TranslatorTool, description: 'Translate text between languages.', available: true },
  { id: 'profile-enhancer', name: 'Profile Enhancer', icon: Sparkles, component: ProfileEnhancerTool, description: 'Generate a bio and aura with AI.', available: true },
  { id: 'image-generator', name: 'Image Generator', icon: ImageIcon, component: null, description: 'Coming Soon - Requires Imagen API', available: false },
  { id: 'image-editor', name: 'Image Editor', icon: Wand2, component: null, description: 'Coming Soon', available: false },
  { id: 'code-helper', name: 'Code Helper', icon: Code, component: null, description: 'Coming Soon', available: false },
  { id: 'math-solver', name: 'Math Solver', icon: Sigma, component: null, description: 'Coming Soon', available: false },
  { id: 'summarizer', name: 'Summarizer', icon: FileText, component: null, description: 'Coming Soon', available: false },
];

type ToolId = 'assistant' | 'image-generator' | 'translator' | 'code-helper' | 'math-solver' | 'summarizer' | 'image-editor' | 'profile-enhancer';

export default function AiHubPage() {
  const [selectedTool, setSelectedTool] = useState<ToolId>('assistant');

  const CurrentTool = aiTools.find(tool => tool.id === selectedTool)?.component || (() => <div className="text-center p-8 text-muted-foreground">This tool is not yet implemented.</div>);
  const selectedToolMeta = aiTools.find(tool => tool.id === selectedTool);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
        {/* Left Sidebar: Tool Selection */}
        <div className="lg:col-span-1 flex flex-col">
             <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                    <CardTitle className="font-headline text-glow text-lg md:text-xl">AI Tool Arsenal</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
                    {aiTools.map(tool => (
                        <div
                            key={tool.id}
                            onClick={() => tool.available && setSelectedTool(tool.id as ToolId)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 md:gap-2 p-2 md:p-4 rounded-lg bg-muted/30 transition-colors aspect-square text-center relative',
                                tool.available ? 'hover:bg-muted cursor-pointer' : 'opacity-50 cursor-not-allowed',
                                selectedTool === tool.id && 'neon-border-primary'
                            )}
                        >
                            <tool.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                            <span className="text-xs md:text-sm font-semibold">{tool.name}</span>
                            {!tool.available && <span className="absolute top-1 right-1 text-[10px] bg-yellow-500/20 text-yellow-500 px-1 rounded">Soon</span>}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Main Content: Selected Tool UI */}
        <div className="lg:col-span-3 flex flex-col">
             <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-headline text-glow text-2xl">
                      {selectedToolMeta && <selectedToolMeta.icon className="w-7 h-7 text-primary"/>}
                      {selectedToolMeta?.name}
                  </CardTitle>
                  <p className="text-muted-foreground">{selectedToolMeta?.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-4 pt-0 overflow-hidden">
                    <CurrentTool />
                </CardContent>
             </Card>
        </div>
    </div>
  );
}
