import { TenantAccessGate } from '@/components/tenant/TenantAccessGate';

export default function BrollLayout({ children }: { children: React.ReactNode }) {
  return <TenantAccessGate>{children}</TenantAccessGate>;
}
