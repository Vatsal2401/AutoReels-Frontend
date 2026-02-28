'use client';

import { useState } from 'react';
import { submitComment } from '@/lib/api/blog';
import { Button } from '@/components/ui/button';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  is_approved: boolean;
}

interface CommentsSectionProps {
  slug: string;
  comments?: Comment[];
}

export default function CommentsSection({ slug, comments = [] }: CommentsSectionProps) {
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Only show approved comments
  const approvedComments = comments.filter((c) => c.is_approved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !authorEmail || !content) {
      setErrorMessage('Please fill out all fields');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await submitComment(slug, { author_name: authorName, author_email: authorEmail, content });
      setSuccessMessage('Your comment has been submitted and is pending approval.');
      setAuthorName('');
      setAuthorEmail('');
      setContent('');
    } catch (e) {
      setErrorMessage('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-2xl font-bold mb-6">{approvedComments.length} Comments</h3>
        {approvedComments.length > 0 ? (
          <div className="space-y-6">
            {approvedComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-xl border border-border/40 bg-foreground/[0.02]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold flex-1">{comment.author_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to start the conversation!
          </p>
        )}
      </div>

      <div className="bg-foreground/[0.02] p-6 rounded-2xl border border-border/40">
        <h3 className="text-xl font-bold mb-6">Leave a Reply</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                autoComplete="name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                autoComplete="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="john@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Your email address will not be published.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Comment
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="What are your thoughts?"
            />
          </div>

          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          {successMessage && <p className="text-sm text-primary font-medium">{successMessage}</p>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Post Comment'}
          </Button>
        </form>
      </div>
    </div>
  );
}
