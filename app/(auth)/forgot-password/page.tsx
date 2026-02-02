import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="w-full max-w-md mx-auto">
          <Card className="glass-strong border-border/50 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 mb-2">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Reset your password
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-semibold">
                  Send reset link
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
