'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/format';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn('glass-strong hover:scale-[1.01] transition-all duration-200', className)}>
      <CardContent className="px-6 pt-8 pb-7">
        <div className="flex items-center justify-between gap-5 h-full">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-3xl font-bold leading-tight">{value}</p>
            {trend && <p className="text-xs text-muted-foreground mt-2">{trend}</p>}
          </div>
          <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-ai shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
