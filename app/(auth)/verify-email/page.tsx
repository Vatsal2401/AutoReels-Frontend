"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        // Use email from URL or fall back to current logged-in user's email
        const targetEmail = email || authUser?.email || undefined;
        const response = await authApi.verifyEmail(token, targetEmail);
        
        // Save tokens to log the user in automatically
        if (response.access_token) {
          const { tokenStorage } = await import("@/lib/utils/token");
          tokenStorage.setAccessToken(response.access_token);
          if (response.refresh_token) {
            tokenStorage.setRefreshToken(response.refresh_token);
          }
          
          setStatus("success");
          setMessage(response.message || "Email verified successfully!");
          
          // Dismiss the reminder toast if it exists
          const { toast } = await import("sonner");
          toast.dismiss("verify-email-reminder");
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 800);
        } else {
          setStatus("success");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed. The link may be expired.");
      }
    };

    verify();
  }, [token, email, authUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full glass-strong border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
            {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Success!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we confirm your email address."}
            {status === "success" && (
              <div className="space-y-2">
                <p>{message || "Your email has been successfully verified. You can now use all features of AutoReels."}</p>
                <p className="text-primary font-medium flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to dashboard...
                </p>
              </div>
            )}
            {status === "error" && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status !== "loading" && (
            <Link href="/login" className="w-full">
              <Button className="w-full">
                {status === "success" ? "Sign In" : "Back to Login"}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
