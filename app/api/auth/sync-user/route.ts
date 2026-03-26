import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveUserToDatabase } from "@/lib/supabase/user-store";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth().catch(() => null);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    console.error("Sync user skipped: no authenticated user email.");
    return NextResponse.json({ ok: false, error: "No authenticated user." }, { status: 401 });
  }

  console.info("Login success.", { email });
  const result = await saveUserToDatabase({ email });

  if (!result.ok) {
    console.error("Sync user save error.", { email, reason: result.reason });
    return NextResponse.json({ ok: false, error: result.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
