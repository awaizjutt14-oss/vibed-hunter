import { NextResponse } from "next/server";
import { getCurrentTrialStatus } from "@/lib/generation-access";

export const runtime = "nodejs";

export async function GET() {
  const status = await getCurrentTrialStatus();
  if (!status.authenticated) {
    return NextResponse.json(status.trial, { status: status.restricted ? 403 : 401 });
  }
  return NextResponse.json(status.trial);
}
