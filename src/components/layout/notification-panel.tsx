
'use client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Bell, CheckCheck, MessageSquare, FileUp } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
    new_message: <MessageSquare className="w-5 h-5 text-primary" />,
    file_upload: <FileUp className="w-5 h-5 text-green-500" />,
    task_reminder: <Bell className="w-5 h-5 text-yellow-500" />,
    system_alert: <Bell className="w-5 h-5 text-destructive" />,
    friend_request: <Bell className="w-5 h-5 text-secondary" />,
};

interface NotificationPanelProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function NotificationPanel({ isOpen, onOpenChange }: NotificationPanelProps) {
    const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        // Potentially navigate to notification.link if it exists
        onOpenChange(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col p-0 glass-card" side="right">
                <SheetHeader className="p-6 pb-4">
                    <SheetTitle className="flex items-center gap-3 font-headline text-2xl text-glow">
                        <Bell className="text-primary" />
                        Notifications
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1">
                    <div className="p-6 pt-0 space-y-4">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[200px]" />
                                        <Skeleton className="h-4 w-[150px]" />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length === 0 ? (
                             <div className="flex flex-col items-center justify-center text-center h-64 text-muted-foreground">
                                <Bell className="w-12 h-12 mb-4" />
                                <h3 className="text-lg font-headline">No Notifications</h3>
                                <p className="text-sm">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "flex items-start gap-4 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                                        !notification.isRead && "bg-primary/10"
                                    )}
                                >
                                    <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-muted">
                                        {notificationIcons[notification.type] || <Bell className="w-5 h-5 text-primary" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                        <p className="text-xs text-muted-foreground/80 mt-1">
                                            {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary neon-glow-primary mt-1 flex-shrink-0" title="Unread"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                <SheetFooter className="p-4 border-t bg-background/50 backdrop-blur-sm">
                    <Button onClick={markAllAsRead} className="w-full" disabled={notifications.every(n => n.isRead)}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

    