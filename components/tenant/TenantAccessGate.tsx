'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import { getTenantConfig } from '@/lib/tenant/config';

/**
 * Guards B-roll routes in tenant deployments.
 * In non-tenant mode (NEXT_PUBLIC_TENANT unset) this is a no-op pass-through.
 * In tenant mode, redirects to /access-denied if broll_enabled is false.
 */
export function TenantAccessGate({ children }: { children: React.ReactNode }) {
  const tenantConfig = getTenantConfig();
  const { brollEnabled, isLoading } = useUserSettings();
  const router = useRouter();

  useEffect(() => {
    if (tenantConfig && !isLoading && !brollEnabled) {
      router.replace('/access-denied');
    }
  }, [tenantConfig, brollEnabled, isLoading, router]);

  // Non-tenant mode: always render children
  if (!tenantConfig) return <>{children}</>;

  // Tenant mode: render children while loading or if access is granted
  if (isLoading || brollEnabled) return <>{children}</>;

  // brollEnabled=false — redirect is in-flight, render nothing
  return null;
}
