
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function NotificationSettings() {
    // In a real app, this state would come from a context or hook
    const notificationSettings = {
        newMessages: true,
        friendRequests: true,
        systemAlerts: false,
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-background/30">
                    <Label htmlFor="new-messages" className="flex flex-col gap-1 cursor-pointer">
                        <span>New Messages</span>
                        <span className="font-normal text-muted-foreground text-sm">Receive notifications for new chat messages.</span>
                    </Label>
                    <Switch id="new-messages" checked={notificationSettings.newMessages} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-background/30">
                    <Label htmlFor="friend-requests" className="flex flex-col gap-1 cursor-pointer">
                        <span>Friend Requests</span>
                        <span className="font-normal text-muted-foreground text-sm">Get notified about new connection requests.</span>
                    </Label>
                    <Switch id="friend-requests" checked={notificationSettings.friendRequests} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-background/30">
                    <Label htmlFor="system-alerts" className="flex flex-col gap-1 cursor-pointer">
                        <span>System Alerts & News</span>
                        <span className="font-normal text-muted-foreground text-sm">Receive important system-wide alerts and breaking news.</span>
                    </Label>
                    <Switch id="system-alerts" checked={notificationSettings.systemAlerts} />
                </div>
            </CardContent>
        </Card>
    );
}
