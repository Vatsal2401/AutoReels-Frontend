'use client';

import { Bell, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/lib/context/NotificationsContext';
import { UserNotification } from '@/lib/api/user-notifications';
import { cn } from '@/lib/utils/format';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationRow({ notification, onAction }: { notification: UserNotification; onAction: () => void }) {
  const router = useRouter();
  const { markRead } = useNotifications();

  const handleClick = () => {
    if (!notification.read) markRead(notification.id);
  };

  const handleViewReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) markRead(notification.id);
    if (notification.action_href) router.push(notification.action_href);
    onAction();
  };

  const isCompleted = notification.type === 'video_completed';

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50',
        !notification.read && 'border-l-2 border-primary bg-primary/5',
      )}
    >
      <div
        className={cn(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isCompleted ? 'bg-green-500/15 text-green-500' : 'bg-destructive/15 text-destructive',
        )}
      >
        <Video className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-tight">
          {notification.title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{notification.message}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground/60">{timeAgo(notification.created_at)}</span>
          {notification.action_href && (
            <button
              onClick={handleViewReel}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              View Reel →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 max-h-[480px] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <p className="text-sm font-bold text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                We'll let you know when your reels are ready.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                onAction={() => {
                  // close popover naturally when navigating
                }}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
