import { LoginForm } from "@/components/auth/LoginForm";
import { Header } from "@/components/layout/Header";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16 bg-gradient-to-br from-background via-background to-primary/5">
        <LoginForm />
      </main>
    </div>
  );
}
