"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function EmailVerificationBanner() {
  const { user, isAuthenticated } = useAuth();
  const [isResending, setIsResending] = useState(false);

  if (!isAuthenticated || !user || user.email_verified) {
    return null;
  }

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authApi.resendVerification();
      toast.success("Verification email resent!");
    } catch (error) {
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative bg-indigo-50 dark:bg-zinc-900 border-b border-indigo-100 dark:border-indigo-500/10 py-2 px-4 shadow-sm z-[60]">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-center">
        {/* Verification Icon - More subtle */}
        <div className="hidden md:flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 shrink-0 border border-indigo-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
        </div>

        <p className="text-[13px] font-medium text-indigo-900/90 dark:text-white/90 leading-relaxed tracking-tight">
          Check your registered email and authenticate your profile.{" "}
          <span className="opacity-60 font-normal hidden sm:inline">If you haven't received it, </span>
          <span className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400 cursor-pointer transition-all">
            check spam folder
          </span>
          <span className="mx-3 opacity-20 text-indigo-300 dark:text-white">|</span>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="group relative font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isResending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span className="underline underline-offset-4 decoration-indigo-500/30 group-hover:decoration-indigo-400 transition-all">
                send again
              </span>
            )}
          </button>
        </p>
      </div>
    </div>
  );
}
