'use client';

import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { likePost } from '@/lib/api/blog';
import { Button } from '@/components/ui/button';

interface LikeButtonProps {
  slug: string;
  initialCount: number;
}

export default function LikeButton({ slug, initialCount }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (hasLiked || isLoading) return;

    setIsLoading(true);
    try {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
      await likePost(slug);
    } catch (e) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
      console.error('Failed to like post', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 ${hasLiked ? 'text-primary border-primary bg-primary/10' : ''}`}
      onClick={handleLike}
      disabled={hasLiked || isLoading}
    >
      <ThumbsUp className="h-4 w-4" />
      {likes} {likes === 1 ? 'Like' : 'Likes'}
    </Button>
  );
}
