'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Languages, Sparkles } from 'lucide-react';
import AssistantTool from '@/components/ai-hub/assistant-tool';
import TranslatorTool from '@/components/ai-hub/translator-tool';
import ProfileEnhancerTool from '@/components/ai-hub/profile-enhancer-tool';

export default function AIHubPage() {
  const [activeTab, setActiveTab] = useState('assistant');

  return (
    <div className="container mx-auto p-4 md:p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-glow">AI Hub</h1>
        <p className="text-muted-foreground">Harness the power of AI to enhance your experience</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="translator" className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline">Translator</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="flex-1 mt-0">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <AssistantTool />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translator" className="flex-1 mt-0">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-primary" />
                Text Translator
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <TranslatorTool />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="flex-1 mt-0">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Profile Enhancer
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <ProfileEnhancerTool />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
