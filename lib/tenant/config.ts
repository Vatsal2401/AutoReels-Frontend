export interface TenantConfig {
  id: string;
  name: string;          // "B-Roll Studio" or client name
  logoPath: string | null; // e.g. "/tenants/broll-client/logo.png" — null until client provides file
  tagline: string;
  defaultRoute: string;  // where to land after login
  allowSignup: boolean;  // false — no self-registration
}

const TENANT_CONFIGS: Record<string, TenantConfig> = {
  'broll-client': {
    id: 'broll-client',
    name: 'Reach Digital',
    logoPath: '/tenants/broll-client/logo.svg',
    tagline: 'Customer Acquisition For High Growth Brands',
    defaultRoute: '/studio/broll',
    allowSignup: false,
  },
};

export function getTenantConfig(): TenantConfig | null {
  const tenant = process.env.NEXT_PUBLIC_TENANT;
  if (!tenant) return null;
  return TENANT_CONFIGS[tenant] ?? null;
}
