'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { Sparkles, Film } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { getTenantConfig } from '@/lib/tenant/config';
import { getUserSettings } from '@/lib/api/user-settings';

// Computed once at module load — stable for the lifetime of this deployment
const tenantConfig = getTenantConfig();

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // In tenant mode: fetch user settings after login to route correctly.
  // `enabled: false` when not in tenant mode (non-tenant goes straight to /dashboard).
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['user-settings'],
    queryFn: getUserSettings,
    enabled: isAuthenticated && !!tenantConfig,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (tenantConfig) {
        // Wait for settings before deciding where to send the user
        if (!settingsLoading) {
          const brollEnabled = settings?.broll_enabled ?? false;
          router.push(brollEnabled ? tenantConfig.defaultRoute : '/access-denied');
        }
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, settings, settingsLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  // ── Tenant-branded login ───────────────────────────────────────────────────
  if (tenantConfig) {
    return (
      <div className="min-h-screen grid lg:grid-cols-[1.3fr_1fr]">
        {/* Left Column — Tenant branding (no AutoReels mentions) */}
        <div className="hidden lg:flex flex-col justify-between bg-[#F3F4FE] p-12 relative overflow-hidden">
          <div className="z-10">
            {tenantConfig.logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenantConfig.logoPath}
                alt={tenantConfig.name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2 font-bold text-2xl text-primary">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                  <Film className="w-5 h-5" />
                </div>
                {tenantConfig.name}
              </div>
            )}
          </div>

          <div className="z-10 max-w-lg space-y-4">
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">
              {tenantConfig.tagline}
            </h1>
          </div>

          <div className="z-10 text-sm text-slate-500">
            &copy; 2026 {tenantConfig.name}. All rights reserved.
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        {/* Right Column — Login form (signup link leads to blocked /signup page) */}
        <main className="flex flex-col items-center justify-center px-4 py-8 lg:px-12 bg-white">
          <div className="w-full max-w-md space-y-8">
            <LoginForm />
          </div>
        </main>
      </div>
    );
  }

  // ── Default AutoReels login ────────────────────────────────────────────────
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
          <h1 className="text-4xl font-bold text-slate-900 leading-tight">
            Create viral faceless videos in seconds.
          </h1>
          <p className="text-lg text-slate-600">
            Join thousands of content creators who are scaling their social media presence with
            AI-generated reels.
          </p>

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

        <div className="z-10 text-sm text-slate-500">
          © 2026 Programmerjokes. All rights reserved.
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Right Column - Form */}
      <main className="flex flex-col items-center justify-center px-4 py-8 lg:px-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
