import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardTitle>Create your workspace</CardTitle>
        <CardDescription className="mt-2">Start with a solo operator account and expand to teams in Phase 3.</CardDescription>
        <form className="mt-6 space-y-4">
          <Input placeholder="Name" />
          <Input placeholder="Email" type="email" />
          <Input placeholder="Password" type="password" />
          <Button className="w-full">Create account</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary">Sign in</Link>
        </p>
      </Card>
    </main>
  );
}
