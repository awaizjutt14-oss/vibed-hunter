import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardTitle>Sign in to Content Hunter AI</CardTitle>
        <CardDescription className="mt-2">Use demo credentials from `.env.example` or wire a real auth provider in production.</CardDescription>
        <form className="mt-6 space-y-4">
          <Input placeholder="Email" type="email" />
          <Input placeholder="Password" type="password" />
          <Button className="w-full">Sign in</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          No account yet? <Link href="/signup" className="text-primary">Create one</Link>
        </p>
      </Card>
    </main>
  );
}
