import type { Metadata } from 'next';
import { TenantAccessGate } from '@/components/tenant/TenantAccessGate';
import { getTenantConfig } from '@/lib/tenant/config';

const tenantConfig = getTenantConfig();

export const metadata: Metadata = tenantConfig
  ? { title: `${tenantConfig.name} | B-Roll Studio` }
  : {};

export default function BrollLayout({ children }: { children: React.ReactNode }) {
  return <TenantAccessGate>{children}</TenantAccessGate>;
}
