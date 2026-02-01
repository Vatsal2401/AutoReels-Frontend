"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CreateVideoForm } from "@/components/video/CreateVideoForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CreateVideoPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 animate-ping">
              <Loader2 className="h-12 w-12 text-primary/20" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:h-full lg:overflow-hidden">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <CreateVideoForm />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
