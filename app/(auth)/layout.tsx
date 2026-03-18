import type { Metadata } from "next";
import { getTenantConfig } from "@/lib/tenant/config";

const tenantConfig = getTenantConfig();

export const metadata: Metadata = {
  title: tenantConfig
    ? `${tenantConfig.name} | B-Roll Studio`
    : undefined,
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
