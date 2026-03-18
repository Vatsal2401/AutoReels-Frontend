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
    name: 'B-Roll Studio',
    logoPath: null, // set to '/tenants/broll-client/logo.png' once client provides the file
    tagline: 'Your B-Roll Asset Manager',
    defaultRoute: '/studio/broll',
    allowSignup: false,
  },
};

export function getTenantConfig(): TenantConfig | null {
  const tenant = process.env.NEXT_PUBLIC_TENANT;
  if (!tenant) return null;
  return TENANT_CONFIGS[tenant] ?? null;
}
