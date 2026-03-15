'use client';

import { useState } from 'react';
import { Download, Loader2, ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/format';
import Link from 'next/link';

type DownloadState = 'idle' | 'loading' | 'success' | 'error';

interface DownloadResult {
  downloadUrl: string;
  filename: string;
  quality: string;
}

function isValidInstagramUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return (
      (u.hostname === 'www.instagram.com' || u.hostname === 'instagram.com') &&
      (u.pathname.includes('/reel/') ||
        u.pathname.includes('/p/') ||
        u.pathname.includes('/tv/') ||
        u.pathname.includes('/reels/'))
    );
  } catch {
    return false;
  }
}

export function InstagramDownloaderTool() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<DownloadState>('idle');
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setErrorMsg('Please paste an Instagram video URL');
      setState('error');
      return;
    }

    if (!isValidInstagramUrl(trimmed)) {
      setErrorMsg(
        'Please enter a valid Instagram URL (e.g. https://www.instagram.com/reel/...)',
      );
      setState('error');
      return;
    }

    setState('loading');
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tools/instagram-downloader/fetch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to fetch video. Please try again.');
      }

      const data: DownloadResult = await res.json();
      setResult(data);
      setState('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(message);
      setState('error');
    }
  };

  const handleReset = () => {
    setUrl('');
    setState('idle');
    setResult(null);
    setErrorMsg('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main card */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-xl shadow-black/5 overflow-hidden">

        {/* Tool header */}
        <div className="px-6 pt-5 pb-4 border-b border-border/40 bg-gradient-to-r from-pink-500/5 to-purple-500/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Download className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">Instagram Video Downloader</span>
            <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Free
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Success state */}
          {state === 'success' && result ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">Video Ready!</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{result.filename}</p>
                  <p className="text-xs text-muted-foreground">Quality: {result.quality}</p>
                </div>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/tools/instagram-downloader/proxy-download?cdnUrl=${encodeURIComponent(result.downloadUrl)}&filename=${encodeURIComponent(result.filename)}`}
                download={result.filename}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
              >
                <Download className="h-4 w-4" />
                Download HD Video
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-xs text-muted-foreground border border-border/60 hover:border-border transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Download another video
              </button>
            </div>
          ) : (
            <form onSubmit={handleDownload} className="space-y-3">
              {/* URL input */}
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (state === 'error') {
                      setState('idle');
                      setErrorMsg('');
                    }
                  }}
                  placeholder="Paste Instagram video URL here..."
                  className={cn(
                    'w-full h-13 px-4 py-3.5 rounded-xl text-sm border bg-background/60 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all',
                    state === 'error'
                      ? 'border-destructive/50 focus:ring-destructive/20'
                      : 'border-border/60',
                  )}
                  disabled={state === 'loading'}
                  autoComplete="off"
                  spellCheck={false}
                />
                {url && state !== 'loading' && (
                  <button
                    type="button"
                    onClick={() => { setUrl(''); setState('idle'); setErrorMsg(''); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Error message */}
              {state === 'error' && errorMsg && (
                <div className="flex items-start gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Download button */}
              <button
                type="submit"
                disabled={state === 'loading'}
                className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {state === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching Video…
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download Video
                  </>
                )}
              </button>

              {/* Example URL hint */}
              <p className="text-[11px] text-center text-muted-foreground/60">
                e.g. https://www.instagram.com/reel/ABC123xyz/
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Cross-sell banner */}
      <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">Want to create your own viral Reels?</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">AutoReels generates AI-powered Reels in 60 seconds — no camera needed.</p>
        </div>
        <Link
          href="/signup"
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Try Free
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
