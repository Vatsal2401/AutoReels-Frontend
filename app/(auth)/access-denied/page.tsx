import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4FE] p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-600">
            Your account doesn&apos;t have access to this portal. Contact your
            administrator to request access.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
