"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { tokenStorage } from "@/lib/utils/token";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        if (!accessToken || !refreshToken) {
          setStatus("error");
          setErrorMessage("Missing authentication tokens. Please try again.");
          return;
        }

        // Store tokens
        tokenStorage.setAccessToken(accessToken);
        tokenStorage.setRefreshToken(refreshToken);

        // Refresh user data
        await refreshUser();

        setStatus("success");

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setErrorMessage(
          error.response?.data?.message ||
            "Authentication failed. Please try again."
        );
      }
    };

    handleCallback();
  }, [searchParams, refreshUser, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md glass-strong">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center space-y-6">
            {status === "loading" && (
              <>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border border-primary/30">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Completing sign in...</h2>
                  <p className="text-muted-foreground">
                    Please wait while we set up your account.
                  </p>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Success!</h2>
                  <p className="text-muted-foreground">
                    You've been signed in successfully. Redirecting...
                  </p>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20 border border-destructive/30">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-semibold">Authentication Failed</h2>
                  <p className="text-muted-foreground">{errorMessage}</p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => router.push("/login")}
                    >
                      Go to Login
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/")}
                    >
                      Go Home
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md glass-strong">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border border-primary/30">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Loading...</h2>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
