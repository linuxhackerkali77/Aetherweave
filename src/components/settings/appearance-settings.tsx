
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import ThemeSettings from '@/components/theme/theme-switcher';

export default function AppearanceSettings() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>Customize the look and feel of your Aetherweave interface.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemeSettings />
                </CardContent>
            </Card>
        </div>
    );
}
