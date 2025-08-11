import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change: string;
  changeColor?: string;
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, change, changeColor = "text-muted-foreground", iconColor = "text-primary" }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="mt-2 text-2xl font-bold">{value}</div>
          </div>
          <div className={cn("p-2 rounded-lg bg-primary/10", iconColor === 'text-destructive' && 'bg-destructive/10')}>
            <Icon className={cn("h-6 w-6", iconColor, iconColor === 'text-destructive' && 'text-destructive')} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn("text-xs", changeColor)}>{change}</p>
      </CardContent>
    </Card>
  );
}
