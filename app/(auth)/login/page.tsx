import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/utils/env";

export default function LoginPage() {
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardTitle>Sign in to Vibed Hunter</CardTitle>
        <CardDescription className="mt-2">
          Use Google to keep your learning profile synced across your devices.
        </CardDescription>
        <div className="mt-6 space-y-4">
          {googleEnabled ? (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/" });
              }}
            >
              <Button className="w-full">Continue with Google</Button>
            </form>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-background/60 p-4 text-sm text-muted-foreground">
              Add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to enable Google login.
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}
