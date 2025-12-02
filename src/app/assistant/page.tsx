'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import AssistantTool from '@/components/ai-hub/assistant-tool';

export default function AssistantPage() {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        {/* Main Chat Window */}
        <div className="lg:col-span-2 flex flex-col h-full">
            <AssistantTool />
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:flex lg:col-span-1 flex-col gap-6">
            <Card>
                 <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-glow">
                      <BrainCircuit className="w-6 h-6 text-primary"/>
                      AI Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <p className="text-sm text-muted-foreground">The AI Assistant has been moved to the new <a href="/ai-hub" className="text-primary underline">AI Hub</a>.</p>
                   <p className="text-sm text-muted-foreground">This page is now a minimal interface. For image generation and other tools, please visit the hub.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
