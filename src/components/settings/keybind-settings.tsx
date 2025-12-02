
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const keybinds = [
  { action: 'Open Command Hub', keys: ['Ctrl', 'K'] },
  { action: 'Toggle Navigation', keys: ['Ctrl', 'B'] },
  { action: 'New Note', keys: ['Ctrl', 'Alt', 'N'] },
  { action: 'Push-to-Talk', keys: ['Not Set'] },
];

export default function KeybindSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keybinds</CardTitle>
        <CardDescription>Customize your keyboard shortcuts for maximum efficiency.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {keybinds.map((bind) => (
          <div key={bind.action} className="flex items-center justify-between p-4 rounded-lg border bg-background/30">
            <p className="font-medium">{bind.action}</p>
            <div className="flex items-center gap-2">
              {bind.keys.map((key) => (
                <kbd key={key} className="pointer-events-none inline-flex h-8 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[14px] font-medium text-muted-foreground opacity-100">
                  {key}
                </kbd>
              ))}
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
