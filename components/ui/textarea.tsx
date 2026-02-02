import * as React from 'react';
import { cn } from '@/lib/utils/format';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-input bg-background/80 backdrop-blur-sm px-4 py-3.5 text-sm ring-offset-background placeholder:text-muted-foreground/70 placeholder:leading-relaxed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 text-left align-top',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
