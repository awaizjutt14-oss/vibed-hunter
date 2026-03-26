import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveUserToDatabase } from "@/lib/supabase/user-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth().catch(() => null);
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  const bodyEmail = body.email?.trim().toLowerCase();
  const email = sessionEmail || bodyEmail;

  if (!email) {
    console.error("Sync user skipped: no authenticated user email.");
    return NextResponse.json({ ok: false, error: "No authenticated user." }, { status: 401 });
  }

  if (sessionEmail && bodyEmail && sessionEmail !== bodyEmail) {
    console.error("Sync user email mismatch.", { sessionEmail, bodyEmail });
    return NextResponse.json({ ok: false, error: "Email mismatch." }, { status: 400 });
  }

  console.info("Login success.", { email });
  const result = await saveUserToDatabase({ email });

  if (!result.ok) {
    console.error("Sync user save error.", { email, reason: result.reason });
    return NextResponse.json({ ok: false, error: result.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
