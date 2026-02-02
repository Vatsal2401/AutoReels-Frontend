import * as React from 'react';
import { cn } from '@/lib/utils/format';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary/20 text-primary border-primary/30',
    secondary: 'bg-secondary/50 text-secondary-foreground border-secondary/50 glass',
    destructive: 'bg-destructive/20 text-destructive border-destructive/30',
    outline: 'border border-input bg-background/50 glass',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
