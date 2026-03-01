export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  (window as any).analytics?.track?.(event, props);
  if (process.env.NODE_ENV === 'development') {
    console.log('[track]', event, props);
  }
}
