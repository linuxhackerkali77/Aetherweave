import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type WidgetProps = {
  id?: string;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  onboardingId?: string;
};

export function Widget({ title, icon: Icon, children, className, onboardingId }: WidgetProps) {
  return (
    <Card 
        className={cn(
            'glass-card flex flex-col', 
            className
        )}
        data-onboarding-id={onboardingId}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-lg text-glow">
          <Icon className="text-primary w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent 
        className="flex-1 flex flex-col"
      >
        {children}
      </CardContent>
    </Card>
  );
}
