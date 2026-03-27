import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthGate } from "@/components/auth/auth-gate";

export default async function LoginPage() {
  const session = await auth().catch(() => null);
  if (session?.user?.email) {
    redirect("/");
  }

  return <AuthGate />;
}
