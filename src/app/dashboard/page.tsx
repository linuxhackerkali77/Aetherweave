
'use client';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { Widget, WidgetProps } from '@/components/dashboard/widget';
import ClockWidget from '@/components/dashboard/clock';
import TimeTrackerWidget from '@/components/dashboard/time-tracker-widget';
import CalendarWidget from '@/components/dashboard/calendar-widget';
import { Calendar, Clock, Timer, Cloud, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import WeatherWidget from '@/components/dashboard/weather-widget';


const widgets: Omit<WidgetProps, 'children'>[] = [
  { id: 'clock', title: 'Chronometer', icon: Clock },
  { id: 'timetracker', title: 'Session Tracker', icon: Timer },
  { id: 'agenda', title: 'Agenda', icon: Calendar },
  { id: 'gaming', title: 'Gaming Dashboard', icon: Gamepad2 },
];

export default function DashboardPage() {
    const widgetComponents: Record<string, React.ReactNode> = {
        clock: <ClockWidget />,
        timetracker: <TimeTrackerWidget />,
        agenda: <CalendarWidget />,
        gaming: (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Gamepad2 className="w-16 h-16 text-primary/50 mb-4" />
                <h3 className="text-lg font-semibold text-glow mb-2">Gaming Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-4">Advanced gaming features and social hub</p>
                <div className="text-xs text-primary font-mono bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    Coming Soon
                </div>
            </div>
        ),
    };

    return (
        <div className="space-y-4 md:space-y-8 instant-load">
            <h1 className="sr-only">AetherDash Dashboard - Your Cyberpunk Digital Hub</h1>
            <WelcomeBanner />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lazy-load">
                 <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                    <Widget title="Weather" icon={Cloud}>
                        <div className="flex flex-col h-full">
                            <div className="flex-1">
                                <WeatherWidget />
                            </div>
                             <div className="mt-4 text-center">
                                <Button asChild variant="outline">
                                    <Link href="/weather">View Full Forecast</Link>
                                </Button>
                            </div>
                        </div>
                    </Widget>
                 </div>
            
                {widgets.map((widget) => (
                    <Widget
                        key={widget.id}
                        {...widget}
                    >
                        {widgetComponents[widget.id!]}
                    </Widget>
                ))}
            </div>
        </div>
    );
}
