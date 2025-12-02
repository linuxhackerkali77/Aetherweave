
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, CheckSquare, Eye, File, MessageSquare, Newspaper, Rocket, StickyNote, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppStats, AppStat } from "@/hooks/use-app-stats";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const appList = [
    {
        id: "ai-hub",
        name: "AI Hub",
        description: "Access a suite of powerful AI tools for generation, translation, and assistance.",
        icon: BrainCircuit,
        href: "/ai-hub",
        color: "text-primary",
        bgColor: "bg-primary/10",
        borderColor: "border-primary/20",
    },
    {
        id: "chat",
        name: "Aether Chat",
        description: "Real-time communication with contacts, groups, and AI.",
        icon: MessageSquare,
        href: "/chat",
        color: "text-secondary",
        bgColor: "bg-secondary/10",
        borderColor: "border-secondary/20",
    },
    {
        id: "news",
        name: "News Feed",
        description: "Coming Soon - Live news feed with breaking news alerts.",
        icon: Newspaper,
        href: "#",
        color: "text-orange-400",
        bgColor: "bg-orange-400/10",
        borderColor: "border-orange-400/20",
        disabled: true,
    },
    {
        id: "notes",
        name: "NoteForge",
        description: "A powerful, real-time editor for all your notes and ideas.",
        icon: StickyNote,
        href: "/notes",
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
        borderColor: "border-yellow-400/20",
    },
    {
        id: "tasks",
        name: "Taskboard",
        description: "Organize your workflow with a dynamic Kanban-style task board.",
        icon: CheckSquare,
        href: "/tasks",
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        borderColor: "border-green-400/20",
    },
    {
        id: "files",
        name: "CloudDrive",
        description: "Coming Soon - Securely manage and share your files in the cloud.",
        icon: File,
        href: "#",
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        borderColor: "border-blue-400/20",
        disabled: true,
    },
];

export default function AppsPage() {
    const { appStats, loading, incrementViewCount } = useAppStats();
    const [loadingAppId, setLoadingAppId] = useState<string | null>(null);

    const handleLaunch = (appId: string) => {
        setLoadingAppId(appId);
        incrementViewCount(appId);
    };

    const appsWithStats = useMemo(() => {
        return appList.map(app => {
            const stats = appStats.find(stat => stat.appId === app.id);
            return {
                ...app,
                viewCount: stats?.viewCount || 0,
            };
        });
    }, [appStats]);

    const trendingApps = useMemo(() => {
        return [...appsWithStats].sort((a, b) => b.viewCount - a.viewCount).slice(0, 3);
    }, [appsWithStats]);

    const hasTrendingApps = useMemo(() => {
        return trendingApps.length > 0 && trendingApps.some(app => app.viewCount > 0);
    }, [trendingApps]);

    return (
        <div className="space-y-4 md:space-y-8 instant-load">
            <h1 className="sr-only">AetherDash Apps - Productivity Tools and Features</h1>
            {/* Trending Apps Banner */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-glow">
                        <TrendingUp className="text-primary"/>
                        Most Used Apps by You
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : hasTrendingApps ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                            {trendingApps.map((app) => (
                                <Link href={app.href} key={app.name} onClick={() => handleLaunch(app.id)}>
                                    <div className={cn("p-4 rounded-lg flex items-center justify-between gap-4 transition-all hover:scale-[1.02] hover:shadow-lg", app.bgColor, app.borderColor, "border-2")}>
                                        <div className="flex items-center gap-4">
                                            <app.icon className={cn("w-8 h-8", app.color)} />
                                            <div>
                                                <h3 className="font-semibold">{app.name}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{app.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                           <Eye className="w-4 h-4"/>
                                           <span>{app.viewCount}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="font-headline text-xl">No Apps Used Yet</h3>
                            <p>Start using apps to see your most frequently used ones here!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* App Grid */}
            <div>
                 <h2 className="text-2xl font-headline mb-4 text-glow">App Library</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lazy-load">
                    {appsWithStats.map((app) => (
                        <Card key={app.name} className="flex flex-col group overflow-hidden">
                            <CardHeader className="flex-row items-start gap-4 pb-4">
                                <div className={cn("w-12 h-12 flex items-center justify-center rounded-lg", app.bgColor)}>
                                    <app.icon className={cn("w-6 h-6", app.color)} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-headline">{app.name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                <p className="text-sm text-muted-foreground mb-4">{app.description}</p>
                                <Link href={app.href} className="mt-auto" onClick={() => !app.disabled && handleLaunch(app.id)}>
                                    <Button className="w-full cyber-button" disabled={loadingAppId === app.id || app.disabled}>
                                        {app.disabled ? (
                                            <>
                                                Coming Soon
                                            </>
                                        ) : loadingAppId === app.id ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Launching...
                                            </>
                                        ) : (
                                            <>
                                                Launch App <Rocket className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

    
