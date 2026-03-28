import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAllowedEmail } from "@/lib/access-control";
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

  if (!isAllowedEmail(email)) {
    console.error("Sync user blocked: email not allowed.", { email });
    return NextResponse.json(
      {
        ok: false,
        error: "access_restricted",
        message: "This workspace is currently private. Access is limited to approved accounts."
      },
      { status: 403 }
    );
  }

  if (sessionEmail && bodyEmail && sessionEmail !== bodyEmail) {
    console.error("Sync user email mismatch.", { sessionEmail, bodyEmail });
    return NextResponse.json({ ok: false, error: "Email mismatch." }, { status: 400 });
  }

  console.info("Login success.", { email });
  const result = await saveUserToDatabase({ email });

  if (!result.ok) {
    console.error("Sync user save error.", {
      email,
      reason: result.reason,
      details: "error" in result ? result.error : undefined
    });
    return NextResponse.json(
      {
        ok: false,
        error: result.reason,
        details: "error" in result ? result.error : undefined
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
