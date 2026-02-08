'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { SignupForm } from '@/components/auth/SignupForm';
import { Header } from '@/components/layout/Header';

export default function SignupPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.3fr_1fr]">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-[#F3F4FE] p-12 relative overflow-hidden">
        <div className="z-10">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="w-5 h-5" />
            </div>
            AutoReels
          </Link>
        </div>

        <div className="z-10 max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">
              Create viral faceless videos in seconds.
            </h1>
            <p className="text-lg text-slate-600">
              Join thousands of content creators who are scaling their social media presence with
              AI-generated reels.
            </p>
          </div>

          <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-white/10">
            {/* Mock Dashboard UI */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="p-4 border-b border-white/5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                </div>
                <div className="h-2 w-32 bg-white/10 rounded-full ml-4" />
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="h-2 w-24 bg-indigo-500/50 rounded-full" />
                  <div className="h-8 w-full bg-white/5 rounded-lg border border-white/10 flex items-center px-3">
                    <span className="text-xs text-slate-400">Funny cat facts...</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="h-20 w-1/3 bg-white/5 rounded-lg border border-white/10 animate-pulse" />
                    <div className="h-20 w-1/3 bg-white/5 rounded-lg border border-white/10 animate-pulse delay-75" />
                    <div className="h-20 w-1/3 bg-white/5 rounded-lg border border-white/10 animate-pulse delay-150" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Generating viral captions...
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 text-sm text-slate-500">© 2026 AutoReels. All rights reserved.</div>

        {/* Background Pattern */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Right Column - Form */}
      <main className="flex flex-col items-center justify-center px-4 py-8 lg:px-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <SignupForm />
        </div>
      </main>
    </div>
  );
}
